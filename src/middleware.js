const basicAuth = require('express-basic-auth');
const pug = require('pug');

const middleware = (configuration = {}) => {
  const { depotDonnees, adaptateurJWT, login, motDePasse } = configuration;

  const authentificationBasique = basicAuth({
    challenge: true,
    realm: 'Administration Mon Service Sécurisé',
    users: { [login]: motDePasse },
    unauthorizedResponse: () => pug.renderFile('src/vues/accesRefuse.pug'),
  });

  const suppressionCookie = (requete, reponse, suite) => {
    requete.session = null;
    suite();
  };

  const verificationJWT = (requete, reponse, suite) => {
    const token = adaptateurJWT.decode(requete.session.token);
    if (!token) reponse.redirect('/connexion');
    else {
      requete.idUtilisateurCourant = token.idUtilisateur;
      requete.cguAcceptees = token.cguAcceptees;
      suite();
    }
  };

  const verificationAcceptationCGU = (requete, reponse, suite) => {
    verificationJWT(requete, reponse, () => {
      if (!requete.cguAcceptees) reponse.redirect('/utilisateur/edition');
      else suite();
    });
  };

  const trouveHomologation = (requete, reponse, suite) => {
    verificationAcceptationCGU(requete, reponse, () => {
      const homologation = depotDonnees.homologation(requete.params.id);
      if (!homologation) reponse.status(404).send('Homologation non trouvée');
      else if (homologation.idUtilisateur !== requete.idUtilisateurCourant) {
        reponse.status(403).send("Accès à l'homologation refusé");
      } else {
        requete.homologation = homologation;
        suite();
      }
    });
  };

  return {
    authentificationBasique,
    trouveHomologation,
    suppressionCookie,
    verificationAcceptationCGU,
    verificationJWT,
  };
};

module.exports = middleware;
