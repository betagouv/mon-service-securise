const adaptateurUUIDParDefaut = require('../adaptateurs/adaptateurUUID');
const fabriqueAdaptateurPersistance = require('../adaptateurs/fabriqueAdaptateurPersistance');
const {
  ErreurAutorisationExisteDeja,
  ErreurAutorisationInexistante,
  ErreurHomologationInexistante,
  ErreurTentativeSuppressionCreateur,
  ErreurTranfertVersUtilisateurSource,
  ErreurUtilisateurInexistant,
} = require('../erreurs');
const AutorisationCreateur = require('../modeles/autorisations/autorisationCreateur');
const FabriqueAutorisation = require('../modeles/autorisations/fabriqueAutorisation');
const {
  toutDroitsEnEcriture,
} = require('../modeles/autorisations/gestionDroits');

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = adaptateurUUIDParDefaut,
    depotHomologations,
    depotUtilisateurs,
  } = config;

  const autorisations = (idUtilisateur) =>
    adaptateurPersistance
      .autorisations(idUtilisateur)
      .then((as) => as.map((a) => FabriqueAutorisation.fabrique(a)));

  const accesAutorise = async (idUtilisateur, idHomologation, droitsRequis) => {
    const as = await autorisations(idUtilisateur);
    const autorisationPourService = as.find(
      (a) => a.idHomologation === idHomologation
    );

    if (!autorisationPourService) return false;

    return autorisationPourService.aLesPermissions(droitsRequis);
  };

  const autorisation = (id) =>
    adaptateurPersistance
      .autorisation(id)
      .then((a) => (a ? FabriqueAutorisation.fabrique(a) : undefined));

  const autorisationsDuService = async (id) => {
    const as = await adaptateurPersistance.autorisationsDuService(id);
    return as.map((a) => FabriqueAutorisation.fabrique(a));
  };

  const autorisationPour = (...params) =>
    adaptateurPersistance
      .autorisationPour(...params)
      .then((a) => (a ? FabriqueAutorisation.fabrique(a) : undefined));

  const autorisationExiste = (...params) =>
    autorisationPour(...params).then((a) => !!a);

  const ajouteContributeurAHomologation = (nouvelleAutorisation) => {
    const verifieUtilisateurExiste = (id) =>
      depotUtilisateurs.utilisateurExiste(id).then((existe) => {
        if (!existe)
          throw new ErreurUtilisateurInexistant(
            `Le contributeur "${id}" n'existe pas`
          );
      });

    const verifieHomologationExiste = (id) =>
      depotHomologations
        .homologation(nouvelleAutorisation.idService)
        .then((h) => {
          if (!h)
            throw new ErreurHomologationInexistante(
              `L'homologation "${id}" n'existe pas`
            );
        });

    const verifieAutorisationInexistante = (...params) =>
      autorisationExiste(...params).then((existe) => {
        if (existe)
          throw new ErreurAutorisationExisteDeja("L'autorisation existe déjà");
      });

    const idAutorisation = adaptateurUUID.genereUUID();

    return verifieUtilisateurExiste(nouvelleAutorisation.idUtilisateur)
      .then(() => verifieHomologationExiste(nouvelleAutorisation.idService))
      .then(() =>
        verifieAutorisationInexistante(
          nouvelleAutorisation.idUtilisateur,
          nouvelleAutorisation.idService
        )
      )
      .then(() =>
        adaptateurPersistance.ajouteAutorisation(idAutorisation, {
          idUtilisateur: nouvelleAutorisation.idUtilisateur,
          idHomologation: nouvelleAutorisation.idService,
          idService: nouvelleAutorisation.idService,
          type: 'contributeur',
          droits: toutDroitsEnEcriture(),
        })
      );
  };

  const supprimeContributeur = (...params) => {
    const verifieAutorisationExiste = (idContributeur, idHomologation) =>
      autorisationExiste(idContributeur, idHomologation).then((existe) => {
        if (!existe) {
          throw new ErreurAutorisationInexistante(
            `L'utilisateur "${idContributeur}" n'est pas contributeur de l'homologation "${idHomologation}"`
          );
        }
      });

    const verifieSuppressionPermise = (idContributeur, idHomologation) =>
      autorisationPour(idContributeur, idHomologation).then((a) => {
        if (a.constructor.name === AutorisationCreateur.name) {
          throw new ErreurTentativeSuppressionCreateur(
            `Suppression impossible : l'utilisateur "${idContributeur}" est le propriétaire de l'homologation "${idHomologation}"`
          );
        }
      });

    return verifieAutorisationExiste(...params)
      .then(() => verifieSuppressionPermise(...params))
      .then(() => adaptateurPersistance.supprimeAutorisation(...params));
  };

  const transfereAutorisations = (idUtilisateurSource, idUtilisateurCible) => {
    const verifieUtilisateurExiste = (id) =>
      depotUtilisateurs.utilisateurExiste(id).then((existe) => {
        if (!existe)
          throw new ErreurUtilisateurInexistant(
            `L'utilisateur "${id}" n'existe pas`
          );
      });

    const verifieUtilisateursSourceDestinationDifferents = () => {
      if (idUtilisateurSource === idUtilisateurCible) {
        throw new ErreurTranfertVersUtilisateurSource(
          "Transfert d'un utilisateur vers lui-même interdit"
        );
      }
    };

    return verifieUtilisateurExiste(idUtilisateurSource)
      .then(() => verifieUtilisateurExiste(idUtilisateurCible))
      .then(() => verifieUtilisateursSourceDestinationDifferents())
      .then(() =>
        adaptateurPersistance.transfereAutorisations(
          idUtilisateurSource,
          idUtilisateurCible
        )
      );
  };

  return {
    accesAutorise,
    ajouteContributeurAHomologation,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    supprimeContributeur,
    transfereAutorisations,
  };
};

module.exports = { creeDepot };
