const basicAuth = require('express-basic-auth');
const pug = require('pug');

const middleware = (configuration = {}) => {
  const { adaptateurJWT, login, motDePasse } = configuration;

  const authentificationBasique = basicAuth({
    challenge: true,
    realm: 'Administration Mon Service Sécurisé',
    users: { [login]: motDePasse },
    unauthorizedResponse: () => pug.renderFile('src/vues/accesRefuse.pug'),
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
