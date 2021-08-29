const basicAuth = require('express-basic-auth');
const pug = require('pug');
const { body } = require('express-validator');

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
      depotDonnees.utilisateurExiste(token.idUtilisateur)
        .then((utilisateurExiste) => {
          if (!utilisateurExiste) reponse.redirect('/connexion');
          else {
            requete.idUtilisateurCourant = token.idUtilisateur;
            requete.cguAcceptees = token.cguAcceptees;
            suite();
          }
        });
    }
  };

  const verificationAcceptationCGU = (requete, reponse, suite) => {
    verificationJWT(requete, reponse, () => {
      if (!requete.cguAcceptees) reponse.redirect('/utilisateur/edition');
      else suite();
    });
  };

  const trouveHomologation = (requete, reponse, suite) => {
    verificationAcceptationCGU(requete, reponse, () => depotDonnees.homologation(requete.params.id)
      .then((homologation) => {
        if (!homologation) reponse.status(404).send('Homologation non trouvée');
        else if (homologation.idUtilisateur !== requete.idUtilisateurCourant) {
          reponse.status(403).send("Accès à l'homologation refusé");
        } else {
          requete.homologation = homologation;
          suite();
        }
      }));
  };

  const aseptise = (...nomsParametres) => ((requete, reponse, suite) => {
    const aseptisations = nomsParametres.map((p) => body(p).trim().escape().run(requete));
    return Promise.all(aseptisations)
      .then(() => suite())
      .catch(suite);
  });

  const aseptiseTout = (requete, reponse, suite) => {
    const parametresChaines = Object.keys(requete.body)
      .filter((p) => typeof p === 'string');
    return aseptise(parametresChaines)(requete, reponse, suite);
  };

  return {
    aseptise,
    aseptiseTout,
    authentificationBasique,
    trouveHomologation,
    suppressionCookie,
    verificationAcceptationCGU,
    verificationJWT,
  };
};

module.exports = middleware;
