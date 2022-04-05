const adaptateurUUIDParDefaut = require('../adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');
const {
  ErreurAutorisationExisteDeja,
  ErreurAutorisationInexistante,
  ErreurHomologationInexistante,
  ErreurTentativeSuppressionCreateur,
  ErreurUtilisateurInexistant,
} = require('../erreurs');
const AutorisationCreateur = require('../modeles/autorisations/autorisationCreateur');
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

  const supprimeContributeur = (...params) => {
    const verifieAutorisationExiste = (idContributeur, idHomologation) => (
      autorisationExiste(idContributeur, idHomologation)
        .then((existe) => {
          if (!existe) {
            throw new ErreurAutorisationInexistante(
              `L'utilisateur "${idContributeur}" n'est pas contributeur de l'homologation "${idHomologation}"`
            );
          }
        })
    );

    const verifieSuppressionPermise = (idContributeur, idHomologation) => (
      autorisationPour(idContributeur, idHomologation)
        .then((a) => {
          if (a.constructor.name === AutorisationCreateur.name) {
            throw new ErreurTentativeSuppressionCreateur(
              `Suppression impossible : l'utilisateur "${idContributeur}" est le propriétaire de l'homologation "${idHomologation}"`
            );
          }
        })
    );

    return verifieAutorisationExiste(...params)
      .then(() => verifieSuppressionPermise(...params))
      .then(() => adaptateurPersistance.supprimeAutorisation(...params));
  };

  return {
    accesAutorise,
    ajouteContributeurAHomologation,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    supprimeContributeur,
    transfereAutorisations,
  };
};

module.exports = { creeDepot };
