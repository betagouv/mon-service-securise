import { AdaptateurGestionErreur } from './adaptateurGestionErreur.interface.js';

export const fabriqueAdaptateurGestionErreurVide =
  (): AdaptateurGestionErreur => ({
    initialise: () => {},
    identifieUtilisateur: () => {},
    controleurErreurs: (erreur, _requete, _reponse, suite) => suite(erreur),
    logueErreur: () => {},
  });
