const fabriqueServiceGestionnaireSession = () => ({
  enregistreSession: (requete, utilisateur, source) => {
    requete.session.token = utilisateur.genereToken(source);
    requete.session.cguAcceptees = utilisateur.accepteCGU();
    requete.session.estInvite = utilisateur.estUnInvite();
  },
  cguAcceptees: (requete) => requete.session?.cguAcceptees,
});

export { fabriqueServiceGestionnaireSession };
