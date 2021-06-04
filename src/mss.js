const cookieSession = require('cookie-session');
const express = require('express');
require('dotenv').config();

const creeServeur = (depotDonnees, adaptateurJWT,
  avecCookieSecurise = (process.env.NODE_ENV === 'production')) => {
  let serveur;

  const verificationAuthentification = (requete, reponse, suite) => {
    const token = adaptateurJWT.decode(requete.session.token);
    if (token) requete.idUtilisateurCourant = token.idUtilisateur;
    suite();
  };

  const app = express();

  app.use(express.json());
  app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    name: 'token',
    sameSite: true,
    secret: process.env.SECRET_COOKIE,
    secure: avecCookieSecurise,
  }));

  app.set('trust proxy', 1);
  app.set('view engine', 'pug');
  app.set('views', './src/vues');

  app.get('/', (requete, reponse) => {
    reponse.render('index');
  });

  app.get('/connexion', (requete, reponse) => {
    requete.session = null;
    reponse.render('connexion');
  });

  app.get('/homologations', verificationAuthentification, (requete, reponse) => {
    if (requete.idUtilisateurCourant) reponse.render('homologations');
    else reponse.redirect('/connexion');
  });

  app.get('/api/homologations', verificationAuthentification, (requete, reponse) => {
    const homologations = depotDonnees.homologations(requete.idUtilisateurCourant)
      .map((h) => h.toJSON());
    reponse.json({ homologations });
  });

  app.get('/api/utilisateurCourant', verificationAuthentification, (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    if (idUtilisateur) {
      const utilisateur = depotDonnees.utilisateur(idUtilisateur).toJSON();
      reponse.json({ utilisateur });
    } else reponse.status(401).send("Pas d'utilisateur courant.");
  });

  app.post('/api/token', (requete, reponse, suite) => {
    const { login, motDePasse } = requete.body;
    depotDonnees.utilisateurAuthentifie(login, motDePasse)
      .then((utilisateur) => {
        if (utilisateur) {
          const token = utilisateur.genereToken();
          requete.session.token = token;
          reponse.json({ utilisateur: utilisateur.toJSON() });
        } else {
          reponse.status(401).send("L'authentification a échoué.");
        }
      })
      .catch(suite);
  });

  app.use(express.static('public'));

  const ecoute = (port, succes) => {
    serveur = app.listen(port, succes);
  };

  const arreteEcoute = () => {
    serveur.close();
  };

  return { ecoute, arreteEcoute };
};

module.exports = { creeServeur };
