const adaptateurUUIDParDefaut = require('../adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');
const {
  ErreurAutorisationExisteDeja,
  ErreurHomologationInexistante,
  ErreurUtilisateurInexistant,
} = require('../erreurs');
const FabriqueAutorisation = require('../modeles/autorisations/fabriqueAutorisation');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
    depotHomologations,
    depotUtilisateurs,
  } = config;

  const autorisation = (id) => adaptateurPersistance.autorisation(id)
    .then((a) => (a ? FabriqueAutorisation.fabrique(a) : undefined));

  const autorisationPour = (...params) => adaptateurPersistance.autorisationPour(...params)
    .then((a) => (a ? FabriqueAutorisation.fabrique(a) : undefined));

  const autorisationExiste = (...params) => autorisationPour(...params)
    .then((a) => !!a);

  const autorisations = (idUtilisateur) => adaptateurPersistance.autorisations(idUtilisateur)
    .then((as) => as.map((a) => FabriqueAutorisation.fabrique(a)));

  const accesAutorise = (idUtilisateur, idHomologation) => autorisations(idUtilisateur)
    .then((as) => as.some((a) => a.idHomologation === idHomologation));

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => {
    const verifieUtilisateurExiste = (id) => depotUtilisateurs.utilisateurExiste(id)
      .then((existe) => {
        if (!existe) throw new ErreurUtilisateurInexistant(`L'utilisateur "${id}" n'existe pas`);
      });

    return verifieUtilisateurExiste(idUtilisateurSource)
      .then(() => verifieUtilisateurExiste(idUtilisateurCible))
      .then(() => adaptateurPersistance
        .transfereAutorisations(idUtilisateurSource, idUtilisateurCible));
  };

  const ajouteContributeurAHomologation = (idContributeur, idHomologation) => {
    const verifieUtilisateurExiste = (id) => depotUtilisateurs.utilisateurExiste(id)
      .then((existe) => {
        if (!existe) throw new ErreurUtilisateurInexistant(`Le contributeur "${id}" n'existe pas`);
      });

    const verifieHomologationExiste = (id) => depotHomologations.homologation(idHomologation)
      .then((h) => {
        if (!h) throw new ErreurHomologationInexistante(`L'homologation "${id}" n'existe pas`);
      });

    const verifieAutorisationInexistante = (...params) => autorisationExiste(...params)
      .then((existe) => {
        if (existe) throw new ErreurAutorisationExisteDeja("L'autorisation existe déjà");
      });

    const idAutorisation = adaptateurUUID.genereUUID();

    return verifieUtilisateurExiste(idContributeur)
      .then(() => verifieHomologationExiste(idHomologation))
      .then(() => verifieAutorisationInexistante(idContributeur, idHomologation))
      .then(() => adaptateurPersistance.ajouteAutorisation(idAutorisation, {
        idUtilisateur: idContributeur, idHomologation, type: 'contributeur',
      }));
  };

  return {
    accesAutorise,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    transfereAutorisations,
    ajouteContributeurAHomologation,
  };
};

module.exports = { creeDepot };
