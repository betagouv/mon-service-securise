const cookieSession = require('cookie-session');
const express = require('express');

const { ErreurUtilisateurExistant } = require('./erreurs');

require('dotenv').config();

const creeServeur = (depotDonnees, middleware,
  avecCookieSecurise = (process.env.NODE_ENV === 'production')) => {
  let serveur;

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

  app.get('/connexion', middleware.suppressionCookie, (requete, reponse) => {
    reponse.render('connexion');
  });

  app.get('/inscription', middleware.suppressionCookie, (requete, reponse) => {
    reponse.render('inscription');
  });

  app.get('/homologations', middleware.verificationJWT, (requete, reponse) => {
    reponse.render('homologations');
  });

  app.get('/homologation/creation', middleware.verificationJWT, (requete, reponse) => {
    reponse.render('homologation/creation');
  });

  app.get('/homologation/:id', middleware.verificationJWT, (requete, reponse) => {
    const homologation = depotDonnees.homologation(requete.params.id);
    if (!homologation) reponse.status(404).send('Homologation non trouvée');
    else if (homologation.idUtilisateur !== requete.idUtilisateurCourant) {
      reponse.status(403).send("Accès à l'homologation refusé");
    } else reponse.render('homologation', { homologation });
  });

  app.get('/homologation/:id/decision', middleware.verificationJWT, (requete, reponse) => {
    reponse.render('homologation/decision');
  });

  app.get('/api/homologations', middleware.verificationJWT, (requete, reponse) => {
    const homologations = depotDonnees.homologations(requete.idUtilisateurCourant)
      .map((h) => h.toJSON());
    reponse.json({ homologations });
  });

  app.post('/api/homologation', middleware.verificationJWT, (requete, reponse) => {
    if (Object.keys(requete.body).length > 0) {
      const { nomService } = requete.body;
      const idHomologation = depotDonnees.nouvelleHomologation(
        requete.idUtilisateurCourant, { nomService }
      );

      reponse.json({ idHomologation });
    } else reponse.status(422).send("Données insuffisantes pour créer l'homologation");
  });

  app.post('/api/utilisateur', (requete, reponse, suite) => {
    const { prenom, nom, email, motDePasse } = requete.body;
    try {
      depotDonnees.nouvelUtilisateur({ prenom, nom, email, motDePasse })
        .then((utilisateur) => {
          requete.session.token = utilisateur.genereToken();
          const idUtilisateur = utilisateur.id;
          reponse.json({ idUtilisateur });
        })
        .catch(suite);
    } catch (e) {
      if (e instanceof ErreurUtilisateurExistant) {
        reponse.status(422).send('Utilisateur déjà existant pour cette adresse email.');
      } else throw e;
    }
  });

  app.get('/api/utilisateurCourant', middleware.verificationJWT, (requete, reponse) => {
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

  app.use('/statique', express.static('public'));

  const ecoute = (port, succes) => {
    serveur = app.listen(port, succes);
  };

  const arreteEcoute = () => {
    serveur.close();
  };

  return { ecoute, arreteEcoute };
};

module.exports = { creeServeur };
