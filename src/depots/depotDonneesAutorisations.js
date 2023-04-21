const adaptateurUUIDParDefaut = require('../adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');
const {
  ErreurAutorisationExisteDeja,
  ErreurAutorisationInexistante,
  ErreurServiceInexistant,
  ErreurTentativeSuppressionCreateur,
  ErreurTranfertVersUtilisateurSource,
  ErreurUtilisateurInexistant,
} = require('../erreurs');
const AutorisationCreateur = require('../modeles/autorisations/autorisationCreateur');
const FabriqueAutorisation = require('../modeles/autorisations/fabriqueAutorisation');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
    depotServices,
    depotUtilisateurs,
  } = config;

  const autorisations = (idUtilisateur) => adaptateurPersistance.autorisations(idUtilisateur)
    .then((as) => as.map((a) => FabriqueAutorisation.fabrique(a)));

  const accesAutorise = (idUtilisateur, idService) => autorisations(idUtilisateur)
    .then((as) => as.some((a) => a.idService === idService));

  const autorisation = (id) => adaptateurPersistance.autorisation(id)
    .then((a) => (a ? FabriqueAutorisation.fabrique(a) : undefined));

  const autorisationPour = (...params) => adaptateurPersistance.autorisationPour(...params)
    .then((a) => (a ? FabriqueAutorisation.fabrique(a) : undefined));

  const autorisationExiste = (...params) => autorisationPour(...params)
    .then((a) => !!a);

  const ajouteContributeurAService = (idContributeur, idService) => {
    const verifieUtilisateurExiste = (id) => depotUtilisateurs.utilisateurExiste(id)
      .then((existe) => {
        if (!existe) throw new ErreurUtilisateurInexistant(`Le contributeur "${id}" n'existe pas`);
      });

    const verifieServiceExiste = (id) => depotServices.service(idService)
      .then((h) => {
        if (!h) throw new ErreurServiceInexistant(`Le service "${id}" n'existe pas`);
      });

    const verifieAutorisationInexistante = (...params) => autorisationExiste(...params)
      .then((existe) => {
        if (existe) throw new ErreurAutorisationExisteDeja("L'autorisation existe déjà");
      });

    const idAutorisation = adaptateurUUID.genereUUID();

    return verifieUtilisateurExiste(idContributeur)
      .then(() => verifieServiceExiste(idService))
      .then(() => verifieAutorisationInexistante(idContributeur, idService))
      .then(() => adaptateurPersistance.ajouteAutorisation(idAutorisation, {
        idUtilisateur: idContributeur, idHomologation: idService, idService, type: 'contributeur',
      }));
  };

  const supprimeContributeur = (...params) => {
    const verifieAutorisationExiste = (idContributeur, idService) => (
      autorisationExiste(idContributeur, idService)
        .then((existe) => {
          if (!existe) {
            throw new ErreurAutorisationInexistante(
              `L'utilisateur "${idContributeur}" n'est pas contributeur du service "${idService}"`
            );
          }
        })
    );

    const verifieSuppressionPermise = (idContributeur, idService) => (
      autorisationPour(idContributeur, idService)
        .then((a) => {
          if (a.constructor.name === AutorisationCreateur.name) {
            throw new ErreurTentativeSuppressionCreateur(
              `Suppression impossible : l'utilisateur "${idContributeur}" est le propriétaire du service "${idService}"`
            );
          }
        })
    );

    return verifieAutorisationExiste(...params)
      .then(() => verifieSuppressionPermise(...params))
      .then(() => adaptateurPersistance.supprimeAutorisation(...params));
  };

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => {
    const verifieUtilisateurExiste = (id) => depotUtilisateurs.utilisateurExiste(id)
      .then((existe) => {
        if (!existe) throw new ErreurUtilisateurInexistant(`L'utilisateur "${id}" n'existe pas`);
      });

    const verifieUtilisateursSourceDestinationDifferents = () => {
      if (idUtilisateurSource === idUtilisateurCible) {
        throw new ErreurTranfertVersUtilisateurSource("Transfert d'un utilisateur vers lui-même interdit");
      }
    };

    return verifieUtilisateurExiste(idUtilisateurSource)
      .then(() => verifieUtilisateurExiste(idUtilisateurCible))
      .then(() => verifieUtilisateursSourceDestinationDifferents())
      .then(() => adaptateurPersistance
        .transfereAutorisations(idUtilisateurSource, idUtilisateurCible));
  };

  return {
    accesAutorise,
    ajouteContributeurAService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    supprimeContributeur,
    transfereAutorisations,
  };
};

module.exports = { creeDepot };
