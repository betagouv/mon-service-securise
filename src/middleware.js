const middleware = (adaptateurJWT) => {
  const verificationJWT = (requete, reponse, suite) => {
    const token = adaptateurJWT.decode(requete.session.token);
    if (!token) reponse.redirect('/connexion');
    else {
      requete.idUtilisateurCourant = token.idUtilisateur;
      suite();
    }
  };

  return { verificationJWT };
};

module.exports = middleware;
