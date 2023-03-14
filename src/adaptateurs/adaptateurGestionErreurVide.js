const initialise = () => {};
const controleurRequetes = () => (_requete, _reponse, suite) => suite();
const controleurErreurs = () => (_requete, _reponse, suite) => suite();

module.exports = { initialise, controleurRequetes, controleurErreurs };
