const Knex = require('knex');
const { avecPMapPourChaqueElement } = require('../utilitaires/pMap');

const config = require('../../knexfile');

const CORRESPONDANCE_COLONNES_PROPRIETES = {
  date_creation: 'dateCreation',
  email_hash: 'emailHash',
};

const nouvelAdaptateur = (env) => {
  const knex = Knex(config[env]);

  const nomPropriete = (colonne) =>
    CORRESPONDANCE_COLONNES_PROPRIETES[colonne] || colonne;

  const ajouteLigneDansTable = (nomTable, id, donnees) =>
    knex(nomTable).insert({ id, donnees });

  const convertisLigneEnObjet = (ligne) => {
    const { id, donnees, ...autresColonnes } = ligne;
    const autresProprietes = Object.keys(autresColonnes).reduce(
      (acc, clef) => ({ ...acc, [nomPropriete(clef)]: autresColonnes[clef] }),
      {}
    );
    return Object.assign(donnees, { id, ...autresProprietes });
  };

  const metsAJourTable = (nomTable, id, donneesAMettreAJour) =>
    knex(nomTable)
      .where({ id })
      .first()
      .then(({ donnees }) =>
        knex(nomTable)
          .where({ id })
          .update({
            donnees: Object.assign(donnees, donneesAMettreAJour),
          })
      );

  const elementDeTable = (nomTable, id) =>
    knex(nomTable)
      .where({ id })
      .first()
      .then(convertisLigneEnObjet)
      .catch(() => undefined);

  const elementDeTableAvec = (nomTable, nomClef, valeur) =>
    knex(nomTable)
      .whereRaw(`donnees#>>'{${nomClef}}'=?`, valeur)
      .first()
      .then(convertisLigneEnObjet)
      .catch(() => undefined);

  const supprimeEnregistrement = (nomTable, id) =>
    knex(nomTable).where({ id }).del();

  const ajouteService = (...params) =>
    ajouteLigneDansTable('services', ...params);
  const ajouteUtilisateur = (id, donnees, emailHash, idResetMotDePasse) =>
    knex('utilisateurs').insert({
      id,
      donnees,
      email_hash: emailHash,
      id_reset_mdp: idResetMotDePasse,
    });

  const arreteTout = () => knex.destroy();

  const service = async (id) => {
    const requeteHomologation = knex('services')
      .where('id', id)
      .select({ id: 'id', donnees: 'donnees' })
      .first();

    const requeteContributeurs = knex('autorisations as a')
      .join(
        'utilisateurs as u',
        knex.raw("(a.donnees->>'idUtilisateur')::uuid"),
        'u.id'
      )
      .whereRaw("(a.donnees->>'idService')::uuid = ?", id)
      .select({
        id: 'u.id',
        dateCreation: 'u.date_creation',
        donnees: 'u.donnees',
      });

    const requeteSuggestionsActions = knex('suggestions_actions')
      .where({ id_service: id, date_acquittement: null })
      .select({ nature: 'nature' });

    const [h, contributeurs, suggestions] = await Promise.all([
      requeteHomologation,
      requeteContributeurs,
      requeteSuggestionsActions,
    ]);

    return {
      id: h.id,
      ...h.donnees,
      contributeurs: contributeurs.map((c) => ({
        id: c.id,
        dateCreation: c.dateCreation,
        ...c.donnees,
      })),
      suggestionsActions: suggestions,
    };
  };

  const serviceDeprecated = (id) => elementDeTable('services', id);

  const serviceAvecNom = (idUtilisateur, nomService, idServiceMisAJour = '') =>
    knex('services')
      .join(
        'autorisations',
        knex.raw("(autorisations.donnees->>'idService')::uuid"),
        'services.id'
      )
      .whereRaw("autorisations.donnees->>'idUtilisateur'=?", idUtilisateur)
      .whereRaw('not services.id::text=?', idServiceMisAJour)
      .whereRaw(
        "services.donnees#>>'{descriptionService,nomService}'=?",
        nomService
      )
      .select('services.*')
      .first()
      .then(convertisLigneEnObjet)
      .catch(() => undefined);

  const services = (idUtilisateur) => {
    const idsServices = knex('autorisations')
      .whereRaw("(donnees->>'idUtilisateur')::uuid = ?", idUtilisateur)
      .select({ idService: knex.raw("(donnees->>'idService')") })
      .then((lignes) => lignes.map(({ idService }) => idService));

    return avecPMapPourChaqueElement(idsServices, service);
  };

  const tousLesServices = async () => {
    const lignes = await knex('services').select({ id: 'id' });
    const ids = lignes.map(({ id }) => id);

    return avecPMapPourChaqueElement(Promise.resolve(ids), service);
  };

  const metsAJourService = (...params) => metsAJourTable('services', ...params);
  const metsAJourUtilisateur = (id, donneesAMettreAJour, emailHash) =>
    knex('utilisateurs')
      .where({ id })
      .first()
      .then(({ donnees }) => {
        const data = {
          donnees: Object.assign(donnees, donneesAMettreAJour),
        };
        if (emailHash) {
          data.email_hash = emailHash;
        }
        return knex('utilisateurs').where({ id }).update(data);
      });

  const supprimeService = (...params) =>
    supprimeEnregistrement('services', ...params);
  const supprimeUtilisateur = (...params) =>
    supprimeEnregistrement('utilisateurs', ...params);

  const supprimeServices = () => knex('services').del();

  const supprimeUtilisateurs = () => knex('utilisateurs').del();

  const utilisateur = (id) => elementDeTable('utilisateurs', id);

  const utilisateurAvecEmailHash = (emailHash) =>
    knex('utilisateurs')
      .where('email_hash', emailHash)
      .first()
      .then(convertisLigneEnObjet)
      .catch(() => undefined);

  const utilisateurAvecIdReset = (idReset) =>
    elementDeTableAvec('utilisateurs', 'idResetMotDePasse', idReset);
  const tousUtilisateurs = () =>
    knex('utilisateurs').then((tous) => tous.map(convertisLigneEnObjet));

  const autorisation = (id) => elementDeTable('autorisations', id);

  const autorisationPour = (idUtilisateur, idService) =>
    knex('autorisations')
      .whereRaw("donnees->>'idUtilisateur'=? and donnees->>'idService'=?", [
        idUtilisateur,
        idService,
      ])
      .first()
      .then(convertisLigneEnObjet)
      .catch(() => undefined);

  const autorisations = (idUtilisateur) =>
    knex('autorisations')
      .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
      .then((rows) => rows.map(convertisLigneEnObjet));

  const autorisationsDuService = async (idService) => {
    const as = await knex('autorisations').whereRaw(
      "donnees->>'idService'=?",
      idService
    );
    return as.map(convertisLigneEnObjet);
  };

  const ajouteAutorisation = (...params) =>
    ajouteLigneDansTable('autorisations', ...params);

  const nbAutorisationsProprietaire = (idUtilisateur) =>
    knex('autorisations')
      .count('id')
      .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
      .whereRaw("(donnees->>'estProprietaire')::boolean=true")
      .then(([{ count }]) => parseInt(count, 10));

  const sauvegardeService = (id, donneesService) => {
    const testExistence = knex('services')
      .where('id', id)
      .select({ id: 'id' })
      .first()
      .then((ligne) => ligne !== undefined);

    return testExistence.then((dejaConnu) =>
      dejaConnu
        ? metsAJourService(id, donneesService)
        : ajouteService(id, donneesService)
    );
  };

  const sauvegardeAutorisation = async (id, donneesAutorisation) => {
    const ligne = await knex('autorisations')
      .where('id', id)
      .select({ id: 'id' })
      .first();

    const dejaConnue = ligne !== undefined;
    if (dejaConnue)
      await metsAJourTable('autorisations', id, donneesAutorisation);
    else await ajouteLigneDansTable('autorisations', id, donneesAutorisation);
  };

  const supprimeAutorisation = (idUtilisateur, idService) =>
    knex('autorisations')
      .whereRaw("donnees->>'idUtilisateur'=? and donnees->>'idService'=?", [
        idUtilisateur,
        idService,
      ])
      .del();

  const supprimeAutorisations = () => knex('autorisations').del();

  const supprimeAutorisationsContribution = (idUtilisateur) =>
    knex('autorisations')
      .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
      .whereRaw("(donnees->>'estProprietaire')::boolean=false")
      .del();

  const supprimeAutorisationsHomologation = (idService) =>
    knex('autorisations').whereRaw("donnees->>'idService'=?", idService).del();

  const lisParcoursUtilisateur = async (id) =>
    elementDeTable('parcours_utilisateurs', id);

  const sauvegardeParcoursUtilisateur = async (id, donnees) => {
    const ligneExistante =
      (await knex('parcours_utilisateurs')
        .where('id', id)
        .select({ id: 'id' })
        .first()) !== undefined;

    if (!ligneExistante)
      await ajouteLigneDansTable('parcours_utilisateurs', id, donnees);
    else await metsAJourTable('parcours_utilisateurs', id, donnees);
  };

  const rechercheContributeurs = async (idUtilisateur, recherche) => {
    const tousContributeurs = await knex.raw(
      `
                    WITH mes_services
                             AS (SELECT donnees ->>'idService' AS ids_services
                    FROM autorisations
                    WHERE donnees->>'idUtilisateur' = ?
                      AND (donnees->>'estProprietaire')::boolean = true
                        )
                    SELECT DISTINCT
                    ON (u.id) u.id, u.donnees
                    FROM autorisations AS a
                        JOIN utilisateurs AS u
                    ON u.id::TEXT = a.donnees->>'idUtilisateur'
                    WHERE a.donnees->>'idService' IN (SELECT "ids_services" FROM mes_services)
                      AND a.donnees->>'idUtilisateur' != ?
                `,
      [idUtilisateur, idUtilisateur]
    );

    const normalise = (texte) =>
      texte
        ?.toLowerCase()
        // Permet de supprimer les accents : https://stackoverflow.com/a/51874002
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');

    const rechercheNormalisee = normalise(recherche);

    return tousContributeurs.rows
      .map(convertisLigneEnObjet)
      .filter(
        (contributeur) =>
          normalise(contributeur.email).includes(rechercheNormalisee) ||
          normalise(contributeur.prenom)?.includes(rechercheNormalisee) ||
          normalise(contributeur.nom)?.includes(rechercheNormalisee)
      );
  };

  const lisNotificationsExpirationHomologationDansIntervalle = async (
    debut,
    fin
  ) =>
    (
      await knex('notifications_expiration_homologation')
        .where('date_prochain_envoi', '>=', debut)
        .where('date_prochain_envoi', '<', fin)
    ).map((n) => ({
      id: n.id,
      idService: n.id_service,
      dateProchainEnvoi: n.date_prochain_envoi,
      delaiAvantExpirationMois: n.delai_avant_expiration_mois,
    }));

  const sauvegardeNotificationsExpirationHomologation = async (notifications) =>
    knex.batchInsert(
      'notifications_expiration_homologation',
      notifications.map((n) => ({
        id: n.id,
        id_service: n.idService,
        date_prochain_envoi: n.dateProchainEnvoi,
        delai_avant_expiration_mois: n.delaiAvantExpirationMois,
      }))
    );

  const supprimeNotificationsExpirationHomologation = async (ids) =>
    knex('notifications_expiration_homologation').whereIn('id', ids).del();

  const supprimeNotificationsExpirationHomologationPourService = async (
    idService
  ) =>
    knex('notifications_expiration_homologation')
      .where({ id_service: idService })
      .del();

  const marqueNouveauteLue = async (idUtilisateur, idNouveaute) => {
    const nouveauteDejaLue =
      (await knex('notifications_nouveaute')
        .where('id_utilisateur', idUtilisateur)
        .where('id_nouveaute', idNouveaute)
        .select()
        .first()) !== undefined;

    if (!nouveauteDejaLue)
      await knex('notifications_nouveaute').insert({
        id_utilisateur: idUtilisateur,
        id_nouveaute: idNouveaute,
      });
  };

  const nouveautesPourUtilisateur = async (idUtilisateur) =>
    (
      await knex('notifications_nouveaute')
        .where('id_utilisateur', idUtilisateur)
        .select('id_nouveaute')
    )
      // eslint-disable-next-line camelcase
      .map(({ id_nouveaute }) => id_nouveaute);

  const tachesDeServicePour = async (idUtilisateur) => {
    const requete = await knex.raw(
      `
                    select t.*
                    from taches_service t
                             inner join autorisations a
                                        on ((a.donnees ->> 'idService')::uuid = t.id_service and (a.donnees ->> 'estProprietaire')::bool = true)
                    where (a.donnees ->> 'idUtilisateur')::uuid = ?`,
      [idUtilisateur]
    );
    return requete.rows.map(
      /* eslint-disable camelcase */
      ({ id_service, date_creation, date_faite, ...reste }) => ({
        ...reste,
        idService: id_service,
        dateCreation: new Date(date_creation),
        dateFaite: date_faite ? new Date(date_faite) : null,
      })
      /* eslint-enable camelcase */
    );
  };

  const ajouteTacheDeService = async ({ id, idService, nature, donnees }) => {
    await knex('taches_service').insert({
      id,
      id_service: idService,
      date_creation: knex.fn.now(),
      nature,
      donnees,
    });
  };

  const marqueTacheDeServiceLue = async (idTache) => {
    await knex('taches_service')
      .where({ id: idTache })
      .update({ date_faite: knex.fn.now() });
  };

  const ajouteSuggestionAction = async ({ idService, nature }) => {
    await knex('suggestions_actions').insert({
      id_service: idService,
      nature,
    });
  };

  const marqueSuggestionActionFaiteMaintenant = async (
    idService,
    natureSuggestion
  ) => {
    await knex('suggestions_actions')
      .where({ id_service: idService, nature: natureSuggestion })
      .update({ date_acquittement: knex.fn.now() });
  };

  return {
    ajouteAutorisation,
    ajouteSuggestionAction,
    ajouteTacheDeService,
    ajouteUtilisateur,
    arreteTout,
    autorisation,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    service,
    serviceAvecNom,
    services,
    lisNotificationsExpirationHomologationDansIntervalle,
    lisParcoursUtilisateur,
    marqueNouveauteLue,
    marqueSuggestionActionFaiteMaintenant,
    marqueTacheDeServiceLue,
    metsAJourUtilisateur,
    nbAutorisationsProprietaire,
    nouveautesPourUtilisateur,
    rechercheContributeurs,
    sauvegardeService,
    serviceDeprecated,
    sauvegardeAutorisation,
    sauvegardeNotificationsExpirationHomologation,
    sauvegardeParcoursUtilisateur,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsContribution,
    supprimeAutorisationsHomologation,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeService,
    supprimeServices,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    tachesDeServicePour,
    tousLesServices,
    tousUtilisateurs,
    utilisateur,
    utilisateurAvecEmailHash,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
