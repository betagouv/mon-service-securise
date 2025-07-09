const Knex = require('knex');
const { avecPMapPourChaqueElement } = require('../utilitaires/pMap');

const config = require('../../knexfile');

const CORRESPONDANCE_COLONNES_PROPRIETES = {
  date_creation: 'dateCreation',
  email_hash: 'emailHash',
  id_reset_mdp: 'idResetMotDePasse',
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

  const convertisLigneEnObjetSansMiseAPlatDonnees = (ligne) => {
    const { id, donnees, ...autresColonnes } = ligne;
    const autresProprietes = Object.keys(autresColonnes).reduce(
      (acc, clef) => ({ ...acc, [nomPropriete(clef)]: autresColonnes[clef] }),
      {}
    );
    return { id, donnees, ...autresProprietes };
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

  const elementDeTableSansMiseAPlatDonnees = (nomTable, id) =>
    knex(nomTable)
      .where({ id })
      .first()
      .then(convertisLigneEnObjetSansMiseAPlatDonnees)
      .catch(() => undefined);

  const elementDeTableAvecValeurColonneSansMiseAPlatDonnees = (
    nomTable,
    nomColonne,
    valeur
  ) =>
    knex(nomTable)
      .where({ [nomColonne]: valeur })
      .first()
      .then(convertisLigneEnObjetSansMiseAPlatDonnees)
      .catch(() => undefined);

  const supprimeEnregistrement = (nomTable, id) =>
    knex(nomTable).where({ id }).del();

  const ajouteService = async (id, donnees, nomServiceHash, siretHash) =>
    knex('services').insert({
      id,
      donnees,
      nom_service_hash: nomServiceHash,
      siret_hash: siretHash,
    });

  const ajouteUtilisateur = (id, donnees, emailHash) =>
    knex('utilisateurs').insert({
      id,
      donnees,
      email_hash: emailHash,
    });

  const ajouteActiviteMesure = (
    idActeur,
    idService,
    idMesure,
    type,
    typeMesure,
    details
  ) =>
    knex('activites_mesure').insert({
      id_acteur: idActeur,
      id_service: idService,
      id_mesure: idMesure,
      type_mesure: typeMesure,
      type,
      details,
    });

  const activitesMesure = async (idService, idMesure) =>
    knex('activites_mesure')
      .where({ id_service: idService, id_mesure: idMesure })
      .select(
        'type',
        'details',
        'date',
        'id_acteur as idActeur',
        'id_service as idService',
        'id_mesure as idMesure',
        'type_mesure as typeMesure'
      );

  const arreteTout = () => knex.destroy();

  const service = async (id) =>
    knex('services')
      .where('id', id)
      .select({ id: 'id', donnees: 'donnees' })
      .first();

  const serviceExisteAvecHashNom = async (
    idUtilisateur,
    hashNomService,
    idServiceMisAJour
  ) =>
    (
      await knex('services')
        .join(
          'autorisations',
          knex.raw("(autorisations.donnees->>'idService')::uuid"),
          'services.id'
        )
        .whereRaw("autorisations.donnees->>'idUtilisateur'=?", idUtilisateur)
        .whereRaw('not services.id::text=?', idServiceMisAJour)
        .whereRaw('services.nom_service_hash=?', hashNomService)
        .count('services.*')
    )[0].count >= 1;

  const servicesComplets = async (configurationDuWhere) => {
    const { idUtilisateur, idService, hashSiret, tous } = configurationDuWhere;

    const erreurDeConfiguration = () => {
      const json = JSON.stringify(configurationDuWhere);
      return new Error(
        `La configuration passée pour la lecture de service est invalide. Reçue : ${json}`
      );
    };

    const where = () => {
      if (idUtilisateur)
        return `
            WHERE s.id IN (
                SELECT (a.donnees->>'idService')::uuid
                FROM autorisations a
                WHERE (a.donnees->>'idUtilisateur')::uuid = :idUtilisateur
            )`;

      if (idService) return `WHERE s.id = :idService`;

      if (hashSiret) return `WHERE s.siret_hash = :hashSiret`;

      if (tous) return '';

      throw erreurDeConfiguration();
    };

    const requete = await knex.raw(
      `
      SELECT
        s.*,
        COALESCE(suggestions_du_service.suggestions, '[]') AS suggestions,
        COALESCE(utilisateurs_du_service.utilisateurs, '[]') AS utilisateurs
      FROM services s
      
      LEFT JOIN (
        SELECT id_service, json_agg(nature) AS suggestions
        FROM suggestions_actions
        WHERE date_acquittement IS NULL
        GROUP BY id_service
      ) suggestions_du_service ON suggestions_du_service.id_service = s.id
      
      LEFT JOIN (
        SELECT 
          (a.donnees->>'idService')::uuid AS id_service,
          json_agg(u.*) AS utilisateurs
        FROM autorisations a
        JOIN utilisateurs u ON (a.donnees->>'idUtilisateur')::uuid = u.id
        GROUP BY id_service
      ) utilisateurs_du_service ON utilisateurs_du_service.id_service = s.id
    
      ${where()};
      `,
      { idUtilisateur, idService, hashSiret }
    );

    return requete.rows;
  };

  const nombreServices = async (idUtilisateur) => {
    const total = await knex('autorisations')
      .whereRaw("(donnees->>'idUtilisateur')::uuid = ?", idUtilisateur)
      .count();
    return total[0]?.count;
  };

  const metsAJourService = (id, donnees, nomServiceHash, siretHash) =>
    knex('services')
      .where({ id })
      .first()
      .then(() =>
        knex('services').where({ id }).update({
          donnees,
          nom_service_hash: nomServiceHash,
          siret_hash: siretHash,
        })
      );

  const metsAJourIdResetMdpUtilisateur = (id, idResetMotDePasse) =>
    knex('utilisateurs')
      .where({ id })
      .first()
      .then(() =>
        knex('utilisateurs')
          .where({ id })
          .update({ id_reset_mdp: idResetMotDePasse || null })
      );

  const metsAJourUtilisateur = (id, donneesAMettreAJour, emailHash) =>
    knex('utilisateurs')
      .where({ id })
      .first()
      .then(() => {
        const data = {
          donnees: donneesAMettreAJour,
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

  const utilisateur = (id) =>
    elementDeTableSansMiseAPlatDonnees('utilisateurs', id);

  const utilisateurAvecEmailHash = (emailHash) =>
    elementDeTableAvecValeurColonneSansMiseAPlatDonnees(
      'utilisateurs',
      'email_hash',
      emailHash
    );

  const utilisateurAvecIdReset = (idReset) =>
    elementDeTableAvecValeurColonneSansMiseAPlatDonnees(
      'utilisateurs',
      'id_reset_mdp',
      idReset
    );

  const tousUtilisateurs = () =>
    knex('utilisateurs').then((tous) =>
      tous.map(convertisLigneEnObjetSansMiseAPlatDonnees)
    );

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

  const sauvegardeService = (id, donneesService, nomServiceHash, siretHash) => {
    const testExistence = knex('services')
      .where('id', id)
      .select({ id: 'id' })
      .first()
      .then((ligne) => ligne !== undefined);

    return testExistence.then((dejaConnu) =>
      dejaConnu
        ? metsAJourService(id, donneesService, nomServiceHash, siretHash)
        : ajouteService(id, donneesService, nomServiceHash, siretHash)
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

  const contributeursDesServicesDe = async (idProprietaire) => {
    const contributeurs = await knex.raw(
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
      [idProprietaire, idProprietaire]
    );
    return contributeurs.rows.map(convertisLigneEnObjetSansMiseAPlatDonnees);
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

  const supprimeSuggestionsActionsPourService = async (idService) =>
    knex('suggestions_actions').where({ id_service: idService }).del();

  const sauvegardeNouvelIndiceCyber = async (
    idService,
    indiceCyber,
    indiceCyberPersonnalise,
    mesuresParStatut
  ) =>
    knex('evolutions_indice_cyber').insert({
      id_service: idService,
      indice_cyber: indiceCyber,
      indice_cyber_personnalise: indiceCyberPersonnalise,
      mesures_par_statut: mesuresParStatut,
    });

  const lisDernierIndiceCyber = async (idService) =>
    knex('evolutions_indice_cyber')
      .where({ id_service: idService })
      .select({
        idService: 'id_service',
        indiceCyber: 'indice_cyber',
        indiceCyberPersonnalise: 'indice_cyber_personnalise',
        mesuresParStatut: 'mesures_par_statut',
      })
      .orderBy('date', 'desc')
      .first();

  const sante = async () => knex.raw('SELECT 1 + 1;');

  const lisSuperviseursConcernes = async (siret) =>
    (
      await knex('superviseurs')
        .where({ siret_entite_supervisee: siret })
        .select({ idSuperviseur: 'id_superviseur' })
    ).map(({ idSuperviseur }) => idSuperviseur);

  const revoqueSuperviseur = async (idSuperviseur) =>
    knex('superviseurs').where({ id_superviseur: idSuperviseur }).delete();

  const ajouteEntiteAuSuperviseur = async (idSuperviseur, entite) =>
    knex('superviseurs').insert({
      id_superviseur: idSuperviseur,
      siret_entite_supervisee: entite.siret,
      nom_entite_supervisee: entite.nom,
      departement_entite_supervisee: entite.departement,
    });

  const estSuperviseur = async (idUtilisateur) =>
    (
      await knex('superviseurs')
        .where({ id_superviseur: idUtilisateur })
        .count('id_superviseur')
    )[0].count >= 1;

  const superviseur = async (idUtilisateur) => {
    const entitesSupervisees = await knex('superviseurs')
      .where({ id_superviseur: idUtilisateur })
      .select({
        nom: 'nom_entite_supervisee',
        departement: 'departement_entite_supervisee',
        siret: 'siret_entite_supervisee',
      });
    if (entitesSupervisees && entitesSupervisees.length > 0) {
      return { idUtilisateur, entitesSupervisees };
    }
    return undefined;
  };

  const ajouteParrainage = async (
    idUtilisateurFilleul,
    idUtilisateurParrain,
    filleulAFinaliseCompte
  ) =>
    knex('parrainages').insert({
      id_utilisateur_filleul: idUtilisateurFilleul,
      id_utilisateur_parrain: idUtilisateurParrain,
      filleul_a_finalise_compte: filleulAFinaliseCompte,
    });

  const parrainagePour = async (idUtilisateurFilleul) =>
    knex('parrainages')
      .where({ id_utilisateur_filleul: idUtilisateurFilleul })
      .select({
        idUtilisateurFilleul: 'id_utilisateur_filleul',
        idUtilisateurParrain: 'id_utilisateur_parrain',
        filleulAFinaliseCompte: 'filleul_a_finalise_compte',
      })
      .first();

  const metsAJourParrainage = async (
    idUtilisateurFilleul,
    filleulAFinaliseCompte
  ) =>
    knex('parrainages')
      .update({
        filleul_a_finalise_compte: filleulAFinaliseCompte,
      })
      .where({ id_utilisateur_filleul: idUtilisateurFilleul });

  const tousLesSelsDeHachage = async () =>
    knex('sels_de_hachage').select({
      version: 'version',
      empreinte: 'empreinte',
    });

  const ajouteTeleversementServices = async (idUtilisateur, donnees) =>
    knex('televersement_services')
      .insert({
        id_utilisateur: idUtilisateur,
        donnees: { services: donnees },
        progression: -1,
      })
      .onConflict('id_utilisateur')
      .merge();

  const lisTeleversementServices = async (idUtilisateur) =>
    knex('televersement_services')
      .where({ id_utilisateur: idUtilisateur })
      .select('donnees')
      .first();

  const lisProgressionTeleversementServices = async (idUtilisateur) =>
    knex('televersement_services')
      .where({ id_utilisateur: idUtilisateur })
      .select('progression')
      .first();

  const supprimeTeleversementServices = async (idUtilisateur) =>
    knex('televersement_services')
      .where({ id_utilisateur: idUtilisateur })
      .delete();

  const metsAJourProgressionTeleversement = async (
    idUtilisateur,
    progression
  ) =>
    knex('televersement_services')
      .where({ id_utilisateur: idUtilisateur })
      .update({ progression });

  return {
    activitesMesure,
    ajouteAutorisation,
    ajouteParrainage,
    ajouteEntiteAuSuperviseur,
    ajouteSuggestionAction,
    ajouteTacheDeService,
    ajouteUtilisateur,
    ajouteActiviteMesure,
    ajouteTeleversementServices,
    arreteTout,
    autorisation,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    estSuperviseur,
    service,
    serviceExisteAvecHashNom,
    lisDernierIndiceCyber,
    lisNotificationsExpirationHomologationDansIntervalle,
    lisParcoursUtilisateur,
    lisProgressionTeleversementServices,
    lisSuperviseursConcernes,
    lisTeleversementServices,
    marqueNouveauteLue,
    marqueSuggestionActionFaiteMaintenant,
    marqueTacheDeServiceLue,
    metsAJourIdResetMdpUtilisateur,
    metsAJourParrainage,
    metsAJourProgressionTeleversement,
    metsAJourUtilisateur,
    nbAutorisationsProprietaire,
    nombreServices,
    nouveautesPourUtilisateur,
    parrainagePour,
    contributeursDesServicesDe,
    revoqueSuperviseur,
    sante,
    sauvegardeService,
    sauvegardeAutorisation,
    sauvegardeNotificationsExpirationHomologation,
    sauvegardeNouvelIndiceCyber,
    sauvegardeParcoursUtilisateur,
    superviseur,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsContribution,
    supprimeAutorisationsHomologation,
    supprimeNotificationsExpirationHomologation,
    supprimeNotificationsExpirationHomologationPourService,
    supprimeService,
    supprimeServices,
    supprimeSuggestionsActionsPourService,
    supprimeTeleversementServices,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    tachesDeServicePour,
    tousLesSelsDeHachage,
    tousUtilisateurs,
    utilisateur,
    utilisateurAvecEmailHash,
    utilisateurAvecIdReset,
    servicesComplets,
  };
};

module.exports = { nouvelAdaptateur };
