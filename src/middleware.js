const basicAuth = require('express-basic-auth');
const pug = require('pug');
const { check } = require('express-validator');

const middleware = (configuration = {}) => {
  const { depotDonnees, adaptateurJWT, login, motDePasse } = configuration;

  const authentificationBasique = basicAuth({
    challenge: true,
    realm: 'Administration Mon Service Sécurisé',
    users: { [login]: motDePasse },
    unauthorizedResponse: () => pug.renderFile('src/vues/accesRefuse.pug'),
  });

  const repousseExpirationCookie = (requete, reponse, suite) => {
    requete.session.maintenant = Math.floor(Date.now() / 60_000);
    suite();
  };

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
      })
      .catch(() => reponse.status(422).send("L'homologation n'a pas pu être récupérée")));
  };

  const aseptise = (...nomsParametres) => ((requete, reponse, suite) => {
    const paramsTableauxVides = Object.keys(requete.body)
      .filter((p) => (Array.isArray(requete.body[p]) && requete.body[p].length === 0));

    const aseptisations = nomsParametres.map((p) => check(p).trim().escape().run(requete));

    return Promise.all(aseptisations)
      .then(() => paramsTableauxVides.forEach((p) => (requete.body[p] = [])))
      .then(() => suite())
      .catch(suite);
  });

  return {
    aseptise,
    authentificationBasique,
    trouveHomologation,
    repousseExpirationCookie,
    suppressionCookie,
    verificationAcceptationCGU,
    verificationJWT,
  };
};

module.exports = middleware;
