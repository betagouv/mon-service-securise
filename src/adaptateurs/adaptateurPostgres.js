const config = require('../../knexfile.js');

const nouvelAdaptateur = (env) => {
  const knex = require('knex')(config[env]);

  const supprimeUtilisateurs = () => knex('utilisateurs').del();

  const arreteTout = () => knex.destroy();

  const homologation = (id) => elementDeTable('homologations', id);

  const homologations = (idUtilisateur) => knex('homologations')
    .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateur)
    .then((rows) => rows.map(convertisLigneEnObjet));

  const metsAJourHomologation = (...params) => metsAJourTable('homologations', ...params);
  const metsAJourUtilisateur = (...params) => metsAJourTable('utilisateurs', ...params);

  const nbUtilisateurs = () => knex('utilisateurs').count()
    .then((rows) => rows[0]['count(*)']);

  return {
    ajouteHomologation,
    ajouteUtilisateur,
    arreteTout,
    homologation,
    homologations,
    metsAJourHomologation,
    metsAJourUtilisateur,
    nbUtilisateurs,
    supprimeUtilisateurs,
  };
};

module.exports = { nouvelAdaptateur };
