const Knex = require('knex');

const config = require('../../knexfile');

const nouvelAdaptateur = (env) => {
  const knex = Knex(config[env]);

  const ajouteLigneDansTable = (nomTable, id, donnees) => knex(nomTable)
    .insert({ id, donnees });

  const convertisLigneEnObjet = (ligne) => {
    const { id } = ligne;
    const donnees = { ...ligne.donnees };
    return Object.assign(donnees, { id });
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

  const ajouteHomologation = (...params) => ajouteLigneDansTable('homologations', ...params);
  const ajouteUtilisateur = (...params) => ajouteLigneDansTable('utilisateurs', ...params);

  const arreteTout = () => knex.destroy();

  const homologation = (id) => elementDeTable('homologations', id);

  const homologationAvecNomService = (idUtilisateur, nomService, idHomologationMiseAJour = '') => (
    knex('homologations')
      .whereRaw('not id::text=?', idHomologationMiseAJour)
      .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
      .whereRaw("donnees#>>'{informationsGenerales,nomService}'=?", nomService)
      .first()
      .then(convertisLigneEnObjet)
      .catch(() => undefined)
  );

  const homologations = (idUtilisateur) => knex('homologations')
    .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
    .then((rows) => rows.map(convertisLigneEnObjet));

  const metsAJourHomologation = (...params) => metsAJourTable('homologations', ...params);
  const metsAJourUtilisateur = (...params) => metsAJourTable('utilisateurs', ...params);

  const nbUtilisateurs = () => knex('utilisateurs').count()
    .then((rows) => rows[0]['count(*)']);

  const supprimeHomologation = (id) => knex('homologations')
    .where({ id })
    .del();

  const supprimeHomologations = () => knex('homologations').del();

  const supprimeUtilisateur = (id) => knex('utilisateurs')
    .where({ id })
    .del();

  const supprimeUtilisateurs = () => knex('utilisateurs').del();

  const utilisateur = (id) => elementDeTable('utilisateurs', id);

  const utilisateurAvecEmail = (email) => elementDeTableAvec('utilisateurs', 'email', email);
  const utilisateurAvecIdReset = (idReset) => elementDeTableAvec(
    'utilisateurs', 'idResetMotDePasse', idReset
  );

  const autorisations = (idUtilisateur) => knex('autorisations')
    .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
    .then((rows) => rows.map(convertisLigneEnObjet));

  const ajouteAutorisation = (...params) => ajouteLigneDansTable('autorisations', ...params);

  const supprimeAutorisations = () => knex('autorisations').del();

  return {
    ajouteAutorisation,
    ajouteHomologation,
    ajouteUtilisateur,
    arreteTout,
    autorisations,
    homologation,
    homologationAvecNomService,
    homologations,
    metsAJourHomologation,
    metsAJourUtilisateur,
    nbUtilisateurs,
    supprimeAutorisations,
    supprimeHomologation,
    supprimeHomologations,
    supprimeUtilisateur,
    supprimeUtilisateurs,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
