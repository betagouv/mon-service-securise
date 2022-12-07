const Knex = require('knex');

const config = require('../../knexfile');

const CORRESPONDANCE_COLONNES_PROPRIETES = {
  date_creation: 'dateCreation',
};

const nouvelAdaptateur = (env) => {
  const knex = Knex(config[env]);

  const nomPropriete = (colonne) => (CORRESPONDANCE_COLONNES_PROPRIETES[colonne] || colonne);

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
    .then((lignes) => lignes
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
      }, []));

  const metsAJourHomologation = (...params) => metsAJourTable('homologations', ...params);
  const metsAJourService = (...params) => metsAJourTable('services', ...params);
  const metsAJourUtilisateur = (...params) => metsAJourTable('utilisateurs', ...params);

  const nbUtilisateurs = () => knex('utilisateurs').count()
    .then((rows) => rows[0]['count(*)']);

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

  const ajouteAutorisation = (...params) => ajouteLigneDansTable('autorisations', ...params);

  const supprimeAutorisation = (idUtilisateur, idHomologation) => knex('autorisations')
    .whereRaw(
      "donnees->>'idUtilisateur'=? and donnees->>'idHomologation'=?",
      [idUtilisateur, idHomologation],
    )
    .del();

  const supprimeAutorisations = () => knex('autorisations').del();

  const supprimeAutorisationsHomologation = (idHomologation) => knex('autorisations')
    .whereRaw("donnees->>'idHomologation'=?", idHomologation)
    .del();

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => knex('autorisations')
    .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateurSource)
    .update({
      donnees: knex.raw("(jsonb_set(donnees::jsonb, '{ idUtilisateur }', '??'))::json", idUtilisateurCible),
    });

  const utilisateursCreesAvantLe = (date) => knex('utilisateurs')
    .whereRaw('date_creation < ?', date.toISOString())
    .then((lignes) => lignes.map(convertisLigneEnObjet));

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
    metsAJourHomologation,
    metsAJourService,
    metsAJourUtilisateur,
    nbUtilisateurs,
    service,
    supprimeAutorisation,
    supprimeAutorisations,
    supprimeAutorisationsHomologation,
    supprimeHomologation,
    supprimeService,
    supprimeHomologations,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    transfereAutorisations,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
    utilisateursCreesAvantLe,
  };
};

module.exports = { nouvelAdaptateur };
