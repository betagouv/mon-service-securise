const Knex = require('knex');
const { avecPMapPourChaqueElement } = require('../utilitaires/pMap');

const config = require('../../knexfile');

const CORRESPONDANCE_COLONNES_PROPRIETES = {
  date_creation: 'dateCreation',
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

  const ajouteHomologation = (...params) =>
    ajouteLigneDansTable('homologations', ...params);
  const ajouteService = (...params) =>
    ajouteLigneDansTable('services', ...params);
  const ajouteUtilisateur = (...params) =>
    ajouteLigneDansTable('utilisateurs', ...params);

  const arreteTout = () => knex.destroy();

  const homologation = async (id) => {
    const requeteHomologation = knex('homologations')
      .where('id', id)
      .select({ id: 'id', donnees: 'donnees' })
      .first();

    const requeteContributeurs = knex('autorisations as a')
      .join(
        'utilisateurs as u',
        knex.raw("(a.donnees->>'idUtilisateur')::uuid"),
        'u.id'
      )
      .whereRaw("(a.donnees->>'idHomologation')::uuid = ?", id)
      .select({
        id: 'u.id',
        dateCreation: 'u.date_creation',
        donnees: 'u.donnees',
      });

    const [h, contributeurs] = await Promise.all([
      requeteHomologation,
      requeteContributeurs,
    ]);

    return {
      id: h.id,
      ...h.donnees,
      contributeurs: contributeurs.map((c) => ({
        id: c.id,
        dateCreation: c.dateCreation,
        ...c.donnees,
      })),
    };
  };

  const service = (id) => elementDeTable('services', id);

  const homologationAvecNomService = (
    idUtilisateur,
    nomService,
    idHomologationMiseAJour = ''
  ) =>
    knex('homologations')
      .join(
        'autorisations',
        knex.raw("(autorisations.donnees->>'idHomologation')::uuid"),
        'homologations.id'
      )
      .whereRaw("autorisations.donnees->>'idUtilisateur'=?", idUtilisateur)
      .whereRaw('not homologations.id::text=?', idHomologationMiseAJour)
      .whereRaw(
        "homologations.donnees#>>'{descriptionService,nomService}'=?",
        nomService
      )
      .select('homologations.*')
      .first()
      .then(convertisLigneEnObjet)
      .catch(() => undefined);

  const homologations = (idUtilisateur) => {
    const idsHomologations = knex('autorisations')
      .whereRaw("(donnees->>'idUtilisateur')::uuid = ?", idUtilisateur)
      .select({ idHomologation: knex.raw("(donnees->>'idHomologation')") })
      .then((lignes) => lignes.map(({ idHomologation }) => idHomologation));

    return avecPMapPourChaqueElement(idsHomologations, homologation);
  };

  const tousLesServices = async () => {
    const lignes = await knex('services').select({ id: 'id' });
    const ids = lignes.map(({ id }) => id);

    return avecPMapPourChaqueElement(Promise.resolve(ids), homologation);
  };

  const metsAJourHomologation = (...params) =>
    metsAJourTable('homologations', ...params);
  const metsAJourService = (...params) => metsAJourTable('services', ...params);
  const metsAJourUtilisateur = (...params) =>
    metsAJourTable('utilisateurs', ...params);

  const supprimeHomologation = (...params) =>
    supprimeEnregistrement('homologations', ...params);
  const supprimeService = (...params) =>
    supprimeEnregistrement('services', ...params);
  const supprimeUtilisateur = (...params) =>
    supprimeEnregistrement('utilisateurs', ...params);

  const supprimeHomologations = () => knex('homologations').del();

  const supprimeUtilisateurs = () => knex('utilisateurs').del();

  const utilisateur = (id) => elementDeTable('utilisateurs', id);

  const utilisateurAvecEmail = (email) =>
    elementDeTableAvec('utilisateurs', 'email', email);
  const utilisateurAvecIdReset = (idReset) =>
    elementDeTableAvec('utilisateurs', 'idResetMotDePasse', idReset);
  const tousUtilisateurs = () =>
    knex('utilisateurs').then((tous) => tous.map(convertisLigneEnObjet));

  const autorisation = (id) => elementDeTable('autorisations', id);

  const autorisationPour = (idUtilisateur, idHomologation) =>
    knex('autorisations')
      .whereRaw(
        "donnees->>'idUtilisateur'=? and donnees->>'idHomologation'=?",
        [idUtilisateur, idHomologation]
      )
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

  const sauvegardeHomologation = (id, donneesHomologations) => {
    const testExistence = knex('homologations')
      .where('id', id)
      .select({ id: 'id' })
      .first()
      .then((ligne) => ligne !== undefined);

    return testExistence.then((dejaConnue) =>
      dejaConnue
        ? metsAJourHomologation(id, donneesHomologations)
        : ajouteHomologation(id, donneesHomologations)
    );
  };

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

  const supprimeAutorisation = (idUtilisateur, idHomologation) =>
    knex('autorisations')
      .whereRaw(
        "donnees->>'idUtilisateur'=? and donnees->>'idHomologation'=?",
        [idUtilisateur, idHomologation]
      )
      .del();

  const supprimeAutorisations = () => knex('autorisations').del();

  const supprimeAutorisationsContribution = (idUtilisateur) =>
    knex('autorisations')
      .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
      .whereRaw("(donnees->>'estProprietaire')::boolean=false")
      .del();

  const supprimeAutorisationsHomologation = (idHomologation) =>
    knex('autorisations')
      .whereRaw("donnees->>'idHomologation'=?", idHomologation)
      .del();

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
            AS (
              SELECT donnees->>'idService' AS ids_services
                FROM autorisations
                WHERE donnees->>'idUtilisateur' = ? AND (donnees->>'estProprietaire')::boolean = true
            )
            SELECT DISTINCT ON (u.id) u.id, u.donnees
              FROM autorisations AS a
              JOIN utilisateurs AS u ON u.id::TEXT = a.donnees->>'idUtilisateur'
                WHERE a.donnees->>'idService' IN (SELECT "ids_services" FROM mes_services) AND a.donnees->>'idUtilisateur' != ?
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

  const supprimeNotificationsExpirationHomologationPourService = async (
    idService
  ) =>
    knex('notifications_expiration_homologation')
      .where({ id_service: idService })
      .del();

  return {
    ajouteAutorisation,
    ajouteUtilisateur,
    arreteTout,
    autorisation,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    homologation,
    homologationAvecNomService,
    homologations,
    lisNotificationsExpirationHomologationDansIntervalle,
    lisParcoursUtilisateur,
    metsAJourUtilisateur,
    nbAutorisationsProprietaire,
    rechercheContributeurs,
    sauvegardeHomologation,
    sauvegardeService,
    service,
    sauvegardeAutorisation,
    sauvegardeNotificationsExpirationHomologation,
    sauvegardeParcoursUtilisateur,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsContribution,
    supprimeAutorisationsHomologation,
    supprimeHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeService,
    supprimeHomologations,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    tousLesServices,
    tousUtilisateurs,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
