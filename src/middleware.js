const basicAuth = require('express-basic-auth');

const middleware = (adaptateurJWT, login, motDePasse) => {
  const users = {};
  users[login] = motDePasse;

  const authentificationBasique = basicAuth({
    users,
    challenge: true,
    realm: 'Administration Mon Service Sécurisé',
  });

  const verificationJWT = (requete, reponse, suite) => {
    const token = adaptateurJWT.decode(requete.session.token);
    if (!token) reponse.redirect('/connexion');
    else {
      requete.idUtilisateurCourant = token.idUtilisateur;
      suite();
    }
  };

  const suppressionCookie = (requete, reponse, suite) => {
    requete.session = null;
    suite();
  };

  return { authentificationBasique, suppressionCookie, verificationJWT };
};

module.exports = middleware;
