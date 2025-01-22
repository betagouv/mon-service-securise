const fabriqueServiceGestionnaireSession = () => ({
  enregistreSession: (requete, utilisateur, source) => {
    requete.session.token = utilisateur.genereToken(source);
    requete.session.cguAcceptees = utilisateur.accepteCGU();
    requete.session.estInvite = utilisateur.estUnInvite();
  },
});

module.exports = { fabriqueServiceGestionnaireSession };
