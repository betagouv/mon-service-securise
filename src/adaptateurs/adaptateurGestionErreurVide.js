const initialise = () => {};
const controleurErreurs = (erreur, _requete, _reponse, suite) => suite(erreur);
const logueErreur = (_erreur) => {};

module.exports = {
  initialise,
  controleurErreurs,
  logueErreur,
};
