import AdaptateurGestionErreur = require('./adaptateurGestionErreur.interface');

const adaptateurGestionErreurVide: AdaptateurGestionErreur = {
  initialise: () => {},
  controleurErreurs: (erreur, _requete, _reponse, suite) => suite(erreur),
  logueErreur: () => {},
};

module.exports = adaptateurGestionErreurVide;
