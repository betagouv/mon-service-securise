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

  const ajouteContributeurAuService = async (nouvelleAutorisation) => {
    const verifieUtilisateurExiste = async (id) => {
      const existe = await depotUtilisateurs.utilisateurExiste(id);
      if (!existe)
        throw new ErreurUtilisateurInexistant(
          `Le contributeur "${id}" n'existe pas`
        );
    };

    const verifieServiceExiste = async (id) => {
      const h = await depotHomologations.homologation(
        nouvelleAutorisation.idService
      );
      if (!h)
        throw new ErreurServiceInexistant(`Le service "${id}" n'existe pas`);
    };

    const verifieAutorisationInexistante = async (...params) => {
      const existe = await autorisationExiste(...params);
      if (existe)
        throw new ErreurAutorisationExisteDeja("L'autorisation existe déjà");
    };

    const idAutorisation = adaptateurUUID.genereUUID();

    await verifieUtilisateurExiste(nouvelleAutorisation.idUtilisateur);
    await verifieServiceExiste(nouvelleAutorisation.idService);
    await verifieAutorisationInexistante(
      nouvelleAutorisation.idUtilisateur,
      nouvelleAutorisation.idService
    );
    await adaptateurPersistance.ajouteAutorisation(idAutorisation, {
      idUtilisateur: nouvelleAutorisation.idUtilisateur,
      idHomologation: nouvelleAutorisation.idService,
      idService: nouvelleAutorisation.idService,
      type: 'contributeur',
      droits: toutDroitsEnEcriture(),
    });
  };

  const supprimeContributeur = (...params) => {
    const verifieAutorisationExiste = (idContributeur, idHomologation) =>
      autorisationExiste(idContributeur, idHomologation).then((existe) => {
        if (!existe) {
          throw new ErreurAutorisationInexistante(
            `L'utilisateur "${idContributeur}" n'est pas contributeur du service "${idHomologation}"`
          );
        }
      });

    const verifieSuppressionPermise = (idContributeur, idHomologation) =>
      autorisationPour(idContributeur, idHomologation).then((a) => {
        if (a.constructor.name === AutorisationCreateur.name) {
          throw new ErreurTentativeSuppressionCreateur(
            `Suppression impossible : l'utilisateur "${idContributeur}" est le propriétaire du service "${idHomologation}"`
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
    ajouteContributeurAuService,
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
