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

        if (ligne.type === 'contributeur') {
          const contributeur = { id: ligne.idUtilisateur, ...ligne.donneesUtilisateur };
          nouvelleLigne.contributeurs.push(contributeur);
        }

        if (!homologationDejaExistante) acc.push(nouvelleLigne);
        return acc;
      }, []));

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

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => knex('autorisations')
    .whereRaw("donnees->>'idUtilisateur'=?", idUtilisateurSource)
    .update({
      donnees: knex.raw("(jsonb_set(donnees::jsonb, '{ idUtilisateur }', '??'))::json", idUtilisateurCible),
    });

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
    transfereAutorisations,
    utilisateur,
    utilisateurAvecEmail,
    utilisateurAvecIdReset,
  };
};

module.exports = { nouvelAdaptateur };
