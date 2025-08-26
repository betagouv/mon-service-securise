import { fabriqueAdaptateurUUID } from '../adaptateurs/adaptateurUUID.js';
import fabriqueAdaptateurPersistance from '../adaptateurs/fabriqueAdaptateurPersistance.js';

import {
  ErreurAutorisationExisteDeja,
  ErreurAutorisationInexistante,
  ErreurServiceInexistant,
  ErreurUtilisateurInexistant,
  ErreurSuppressionImpossible,
} from '../erreurs.js';
import * as FabriqueAutorisation from '../modeles/autorisations/fabriqueAutorisation.js';
import { EvenementAutorisationsServiceModifiees } from '../bus/evenementAutorisationsServiceModifiees.js';

const creeDepot = (config = {}) => {
  const {
    adaptateurPersistance = fabriqueAdaptateurPersistance(process.env.NODE_ENV),
    adaptateurUUID = fabriqueAdaptateurUUID(),
    depotServices,
    depotUtilisateurs,
    busEvenements,
  } = config;

  const autorisations = (idUtilisateur) =>
    adaptateurPersistance
      .autorisations(idUtilisateur)
      .then((as) => as.map((a) => FabriqueAutorisation.fabrique(a)));

  const accesAutorise = async (idUtilisateur, idService, droitsRequis) => {
    const as = await autorisations(idUtilisateur);
    const autorisationPourService = as.find((a) => a.idService === idService);

    if (!autorisationPourService) return false;

    return autorisationPourService.aLesPermissions(droitsRequis);
  };

  const accesAutoriseAUneListeDeService = async (
    idUtilisateur,
    idsServices,
    droitsRequis
  ) => {
    const as = await autorisations(idUtilisateur);
    const servicesAutorises = as
      .filter((a) => a.aLesPermissions(droitsRequis))
      .map((a) => a.idService);

    return idsServices.every((id) => servicesAutorises.includes(id));
  };

  const autorisation = (id) =>
    adaptateurPersistance
      .autorisation(id)
      .then((a) => (a ? FabriqueAutorisation.fabrique(a) : undefined));

  const publieAutorisationsDuService = async (idService) => {
    const donneesFraiches =
      await adaptateurPersistance.autorisationsDuService(idService);

    const evenement = new EvenementAutorisationsServiceModifiees({
      idService,
      autorisations: donneesFraiches
        .map(FabriqueAutorisation.fabrique)
        .map((a) => ({
          idUtilisateur: a.idUtilisateur,
          droit: a.resumeNiveauDroit(),
        })),
    });

    await busEvenements.publie(evenement);
  };

  const sauvegardeAutorisation = async (uneAutorisation) => {
    const { id, ...donnees } = uneAutorisation.donneesAPersister();
    await adaptateurPersistance.sauvegardeAutorisation(id, donnees);

    await publieAutorisationsDuService(uneAutorisation.idService);
  };

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
      const s = await adaptateurPersistance.verifieServiceExiste(
        nouvelleAutorisation.idService
      );
      if (!s)
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
    await adaptateurPersistance.ajouteAutorisation(
      idAutorisation,
      nouvelleAutorisation.donneesAPersister()
    );

    await publieAutorisationsDuService(nouvelleAutorisation.idService);
  };

  const supprimeContributeur = async (
    idContributeur,
    idService,
    idUtilisateurCourant
  ) => {
    const verifieAutorisationExiste = async () => {
      const existe = await autorisationExiste(idContributeur, idService);
      if (!existe) {
        throw new ErreurAutorisationInexistante(
          `L'utilisateur "${idContributeur}" n'est pas contributeur du service "${idService}"`
        );
      }
    };

    const verifieSuppressionPermise = async () => {
      const impossible = idContributeur === idUtilisateurCourant;
      if (impossible)
        throw new ErreurSuppressionImpossible(
          `L'utilisateur "${idUtilisateurCourant}" ne peut pas supprimer sa propre autorisation`
        );
    };

    await verifieAutorisationExiste();
    await verifieSuppressionPermise();
    await adaptateurPersistance.supprimeAutorisation(idContributeur, idService);
    await depotServices.supprimeContributeur(idService, idContributeur);
    await publieAutorisationsDuService(idService);
  };

  return {
    accesAutorise,
    accesAutoriseAUneListeDeService,
    ajouteContributeurAuService,
    autorisation,
    autorisationExiste,
    autorisationPour,
    autorisations,
    autorisationsDuService,
    sauvegardeAutorisation,
    supprimeContributeur,
  };
};

export { creeDepot };
