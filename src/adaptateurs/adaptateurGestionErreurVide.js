const fabriqueAdaptateurGestionErreurVide = () => ({
  initialise: () => {},
  identifieUtilisateur: () => {},
  controleurErreurs: (erreur, _requete, _reponse, suite) => suite(erreur),
  logueErreur: (_erreur) => {},
});

module.exports = {
  fabriqueAdaptateurGestionErreurVide,
};
