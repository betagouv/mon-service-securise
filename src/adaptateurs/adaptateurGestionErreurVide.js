const initialise = () => {};
const controleurRequetes = () => (_requete, _reponse, suite) => suite();
const controleurErreurs = (erreur, _requete, _reponse, suite) => suite(erreur);
const logueErreur = (_erreur) => {};

module.exports = {
  initialise,
  controleurRequetes,
  controleurErreurs,
  logueErreur,
};
