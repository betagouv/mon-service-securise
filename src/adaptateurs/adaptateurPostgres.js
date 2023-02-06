const Knex = require('knex');

const config = require('../../knexfile');

const CORRESPONDANCE_COLONNES_PROPRIETES = {
  date_creation: 'dateCreation',
};

const nouvelAdaptateur = (env) => {
  const knex = Knex(config[env]);

  const nomPropriete = (colonne) => (CORRESPONDANCE_COLONNES_PROPRIETES[colonne] || colonne);

  const ajouteIntervenantsAHomologations = (lignes) => lignes
    .reduce((acc, ligne) => {
      const homologationDejaExistante = acc.find((h) => h.id === ligne.idHomologation);
      const nouvelleLigne = homologationDejaExistante || {
        id: ligne.idHomologation, ...ligne.donneesHomologation,
      };
      nouvelleLigne.contributeurs ||= [];

      const intervenant = {
        id: ligne.idUtilisateur,
        dateCreation: ligne.dateCreationUtilisateur,
        ...ligne.donneesUtilisateur,
      };

      switch (ligne.type) {
        case 'contributeur':
          nouvelleLigne.contributeurs.push(intervenant);
          break;
        case 'createur':
          nouvelleLigne.createur = intervenant;
          break;
        default: // ne fais rien
      }

      if (!homologationDejaExistante) acc.push(nouvelleLigne);
      return acc;
    }, []);

  const ajouteLigneDansTable = (nomTable, id, donnees) => knex(nomTable)
    .insert({ id, donnees });

  const convertisLigneEnObjet = (ligne) => {
    const { id, donnees, ...autresColonnes } = ligne;
    const autresProprietes = Object.keys(autresColonnes)
      .reduce((acc, clef) => ({ ...acc, [nomPropriete(clef)]: autresColonnes[clef] }), {});
    return Object.assign(donnees, { id, ...autresProprietes });
  };

  const metsAJourTable = (nomTable, id, donneesAMettreAJour) => knex(nomTable)
    .where({ id }).first()
    .then(({ donnees }) => knex(nomTable).where({ id }).update({
      donnees: Object.assign(donnees, donneesAMettreAJour),
    }));

  const elementDeTable = (nomTable, id) => knex(nomTable)
    .where({ id }).first()
    .then(convertisLigneEnObjet)
    .catch(() => undefined);

  const elementDeTableAvec = (nomTable, nomClef, valeur) => knex(nomTable)
    .whereRaw(`donnees#>>'{${nomClef}}'=?`, valeur)
    .first()
    .then(convertisLigneEnObjet)
    .catch(() => undefined);

  const supprimeEnregistrement = (nomTable, id) => knex(nomTable)
    .where({ id })
    .del();

  const ajouteHomologation = (...params) => ajouteLigneDansTable('homologations', ...params);
  const ajouteService = (...params) => ajouteLigneDansTable('services', ...params);
  const ajouteUtilisateur = (...params) => ajouteLigneDansTable('utilisateurs', ...params);

  const arreteTout = () => knex.destroy();

  const homologation = (id) => elementDeTable('homologations', id);

  const service = (id) => elementDeTable('services', id);

  const homologationAvecNomService = (idUtilisateur, nomService, idHomologationMiseAJour = '') => (
    knex('homologations')
      .join('autorisations', knex.raw("(autorisations.donnees->>'idHomologation')::uuid"), 'homologations.id')
      .whereRaw("autorisations.donnees->>'idUtilisateur'=?", idUtilisateur)
      .whereRaw('not homologations.id::text=?', idHomologationMiseAJour)
      .whereRaw("homologations.donnees#>>'{descriptionService,nomService}'=?", nomService)
      .select('homologations.*')
      .first()
      .then(convertisLigneEnObjet)
      .catch(() => undefined)
  );

  const homologations = (idUtilisateur) => knex('homologations as h')
    .join('autorisations as a1', knex.raw("(a1.donnees->>'idHomologation')::uuid"), 'h.id')
    .join(
      'autorisations as a2',
      knex.raw("a1.donnees->>'idHomologation'"),
      knex.raw("a2.donnees->>'idHomologation'"),
    )
    .join('utilisateurs as u', knex.raw("(a2.donnees->>'idUtilisateur')::uuid"), 'u.id')
    .whereRaw("a1.donnees->>'idUtilisateur'=?", idUtilisateur)
    .select({
      idHomologation: 'h.id',
      donneesHomologation: 'h.donnees',
      idUtilisateur: 'u.id',
      dateCreationUtilisateur: 'u.date_creation',
      donneesUtilisateur: 'u.donnees',
      type: knex.raw("a2.donnees->>'type'"),
    })
    .then(ajouteIntervenantsAHomologations);

  const metsAJourHomologation = (...params) => metsAJourTable('homologations', ...params);
  const metsAJourService = (...params) => metsAJourTable('services', ...params);
  const metsAJourUtilisateur = (...params) => metsAJourTable('utilisateurs', ...params);

  const supprimeHomologation = (...params) => supprimeEnregistrement('homologations', ...params);
  const supprimeService = (...params) => supprimeEnregistrement('services', ...params);
  const supprimeUtilisateur = (...params) => supprimeEnregistrement('utilisateurs', ...params);

  const supprimeHomologations = () => knex('homologations').del();

  const supprimeUtilisateurs = () => knex('utilisateurs').del();

  const utilisateur = (id) => elementDeTable('utilisateurs', id);

  const utilisateurAvecEmail = (email) => elementDeTableAvec('utilisateurs', 'email', email);
  const utilisateurAvecIdReset = (idReset) => elementDeTableAvec(
    'utilisateurs', 'idResetMotDePasse', idReset
  );

  const autorisation = (id) => elementDeTable('autorisations', id);

  const autorisationPour = (idUtilisateur, idHomologation) => knex('autorisations')
    .whereRaw(
      "donnees->>'idUtilisateur'=? and donnees->>'idHomologation'=?",
      [idUtilisateur, idHomologation],
    )
    .first()
    .then(convertisLigneEnObjet)
    .catch(() => undefined);

  const autorisations = (idUtilisateur) => knex('autorisations')
    .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
    .then((rows) => rows.map(convertisLigneEnObjet));

  const idsHomologationsCreeesParUtilisateur = (idUtilisateur, idsHomologationsAExclure = []) => knex('autorisations')
    .whereRaw("donnees->>'idUtilisateur'=? AND donnees->>'type'='createur'", idUtilisateur)
    .whereNotIn(knex.raw("donnees->>'idHomologation'"), idsHomologationsAExclure)
    .select({ idHomologation: knex.raw("donnees->>'idHomologation'") })
    .then((lignes) => lignes.map(({ idHomologation }) => idHomologation));

  const ajouteAutorisation = (...params) => ajouteLigneDansTable('autorisations', ...params);

  const nbAutorisationsCreateur = (idUtilisateur) => knex('autorisations')
    .count('id')
    .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
    .whereRaw("donnees->>'type'='createur'")
    .then(([{ count }]) => parseInt(count, 10));

  const supprimeAutorisation = (idUtilisateur, idHomologation) => knex('autorisations')
    .whereRaw(
      "donnees->>'idUtilisateur'=? and donnees->>'idHomologation'=?",
      [idUtilisateur, idHomologation],
    )
    .del();

  const supprimeAutorisations = () => knex('autorisations').del();

  const supprimeAutorisationsContribution = (idUtilisateur) => knex('autorisations')
    .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
    .whereRaw("donnees->>'type'='contributeur'")
    .del();

  const supprimeAutorisationsHomologation = (idHomologation) => knex('autorisations')
    .whereRaw("donnees->>'idHomologation'=?", idHomologation)
    .del();

  const toutesHomologations = () => knex('homologations as h')
    .join('autorisations as a1', knex.raw("(a1.donnees->>'idHomologation')::uuid"), 'h.id')
    .join(
      'autorisations as a2',
      knex.raw("a1.donnees->>'idHomologation'"),
      knex.raw("a2.donnees->>'idHomologation'"),
    )
    .join('utilisateurs as u', knex.raw("(a2.donnees->>'idUtilisateur')::uuid"), 'u.id')
    .select({
      idHomologation: 'h.id',
      donneesHomologation: 'h.donnees',
      idUtilisateur: 'u.id',
      dateCreationUtilisateur: 'u.date_creation',
      donneesUtilisateur: 'u.donnees',
      type: knex.raw("a2.donnees->>'type'"),
    })
    .then(ajouteIntervenantsAHomologations);

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => (
    knex.transaction((trx) => {
      const supprimeAutorisationsContributionDejaPresentes = () => knex('autorisations as a1')
        .join(
          'autorisations as a2',
          knex.raw("a1.donnees->>'idHomologation'"),
          knex.raw("a2.donnees->>'idHomologation'"),
        )
        .whereRaw("a1.donnees->>'idUtilisateur'=?", idUtilisateurSource)
        .whereRaw("a2.donnees->>'idUtilisateur'=?", idUtilisateurCible)
        .whereRaw("a1.donnees->>'type'='contributeur'")
        .whereRaw("a2.donnees->>'type'='contributeur'")
        .del()
        .transacting(trx);

      const operationTransfert = () => knex('autorisations')
        .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateurSource)
        .update({
          donnees: knex.raw("(jsonb_set(donnees::jsonb, '{ idUtilisateur }', '??'))::json", idUtilisateurCible),
        })
        .transacting(trx);

      const supprimeDoublonsCreationContribution = (idUtilisateur) => knex('autorisations as a1')
        .join('autorisations as a2', function jointure() {
          this.on(knex.raw("a1.donnees->>'idHomologation'"), knex.raw("a2.donnees->>'idHomologation'"))
            .andOn(knex.raw("a1.donnees->>'idUtilisateur'"), knex.raw("a2.donnees->>'idUtilisateur'"));
        })
        .whereRaw("a1.donnees->>'idUtilisateur'=?", idUtilisateur)
        .whereRaw("a1.donnees->>'type'='contributeur'")
        .whereRaw("a2.donnees->>'type'='createur'")
        .del()
        .transacting(trx);

      return supprimeAutorisationsContributionDejaPresentes(idUtilisateurSource, idUtilisateurCible)
        .then(operationTransfert)
        .then(() => supprimeDoublonsCreationContribution(idUtilisateurCible))
        .then(trx.commit)
        .catch(trx.rollback);
    },
    { doNotRejectOnRollback: false })
  );

  return {
    ajouteAutorisation,
    ajouteHomologation,
    ajouteService,
    ajouteUtilisateur,
    arreteTout,
    autorisation,
    autorisationPour,
    autorisations,
    homologation,
    homologationAvecNomService,
    homologations,
    idsHomologationsCreeesParUtilisateur,
    metsAJourHomologation,
    metsAJourService,
    metsAJourUtilisateur,
    nbAutorisationsCreateur,
    service,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsContribution,
    supprimeAutorisationsHomologation,
    supprimeHomologation,
    supprimeService,
    supprimeHomologations,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    toutesHomologations,
    transfereAutorisations,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
