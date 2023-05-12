const initialise = () => {};
const controleurRequetes = () => (_requete, _reponse, suite) => suite();
const controleurErreurs = () => (_requete, _reponse, suite) => suite();
const logueErreur = (_erreur) => {};

module.exports = { initialise, controleurRequetes, controleurErreurs, logueErreur };
