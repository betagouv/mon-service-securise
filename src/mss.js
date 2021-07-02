const cookieSession = require('cookie-session');
const express = require('express');

const { ErreurUtilisateurExistant } = require('./erreurs');
const CaracteristiquesComplementaires = require('./modeles/caracteristiquesComplementaires');
const Homologation = require('./modeles/homologation');
const Mesure = require('./modeles/mesure');

require('dotenv').config();

const creeServeur = (depotDonnees, middleware, referentiel,
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
    const homologation = new Homologation({});
    reponse.render('homologation/creation', { referentiel, homologation });
  });

  app.get('/homologation/:id', middleware.verificationJWT, (requete, reponse) => {
    const homologation = depotDonnees.homologation(requete.params.id);
    if (!homologation) reponse.status(404).send('Homologation non trouvée');
    else if (homologation.idUtilisateur !== requete.idUtilisateurCourant) {
      reponse.status(403).send("Accès à l'homologation refusé");
    } else reponse.render('homologation', { homologation });
  });

  app.get('/homologation/:id/caracteristiquesComplementaires',
    middleware.verificationJWT,
    (requete, reponse) => {
      const homologation = depotDonnees.homologation(requete.params.id);
      reponse.render('homologation/caracteristiquesComplementaires', { referentiel, homologation });
    });

  app.get('/homologation/:id/decision', middleware.verificationJWT, (requete, reponse) => {
    const homologation = depotDonnees.homologation(requete.params.id);
    if (!homologation) reponse.status(404).send('Homologation non trouvée');
    else if (homologation.idUtilisateur !== requete.idUtilisateurCourant) {
      reponse.status(403).send("Accès à l'homologation refusé");
    } else reponse.render('homologation/decision', { homologation });
  });

  app.get('/homologation/:id/edition', middleware.verificationJWT, (requete, reponse) => {
    const homologation = depotDonnees.homologation(requete.params.id);
    reponse.render('homologation/edition', { referentiel, homologation });
  });

  app.get('/homologation/:id/mesures', middleware.verificationJWT, (requete, reponse) => {
    const homologation = depotDonnees.homologation(requete.params.id);
    reponse.render('homologation/mesures', { referentiel, homologation });
  });

  app.get('/api/homologations', middleware.verificationJWT, (requete, reponse) => {
    const homologations = depotDonnees.homologations(requete.idUtilisateurCourant)
      .map((h) => h.toJSON());
    reponse.json({ homologations });
  });

  app.post('/api/homologation', middleware.verificationJWT, (requete, reponse) => {
    if (Object.keys(requete.body).length > 0) {
      const {
        nomService,
        natureService,
        provenanceService,
        dejaMisEnLigne,
        fonctionnalites,
        donneesCaracterePersonnel,
        delaiAvantImpactCritique,
        presenceResponsable,
      } = requete.body;

      const idHomologation = depotDonnees.nouvelleHomologation(
        requete.idUtilisateurCourant, {
          nomService,
          natureService,
          provenanceService,
          dejaMisEnLigne,
          fonctionnalites,
          donneesCaracterePersonnel,
          delaiAvantImpactCritique,
          presenceResponsable,
        }
      );

      reponse.json({ idHomologation });
    } else reponse.status(422).send("Données insuffisantes pour créer l'homologation");
  });

  app.put('/api/homologation/:id', middleware.verificationJWT, (requete, reponse) => {
    const {
      nomService,
      natureService,
      provenanceService,
      dejaMisEnLigne,
      fonctionnalites,
      donneesCaracterePersonnel,
      delaiAvantImpactCritique,
      presenceResponsable,
    } = requete.body;

    const idHomologation = depotDonnees.metsAJourHomologation(requete.params.id, {
      nomService,
      natureService,
      provenanceService,
      dejaMisEnLigne,
      fonctionnalites,
      donneesCaracterePersonnel,
      delaiAvantImpactCritique,
      presenceResponsable,
    });

    reponse.json({ idHomologation });
  });

  app.post('/api/homologation/:id/caracteristiquesComplementaires',
    middleware.verificationJWT, (requete, reponse) => {
      const caracteristiques = new CaracteristiquesComplementaires(requete.body, referentiel);
      depotDonnees.ajouteCaracteristiquesAHomologation(requete.params.id, caracteristiques);

      reponse.send({ idHomologation: requete.params.id });
    });

  app.post('/api/homologation/:id/mesures', middleware.verificationJWT, (requete, reponse) => {
    const params = requete.body;
    const identifiantsMesures = Object.keys(params).filter((p) => !p.match(/^modalites-/));
    identifiantsMesures.forEach((im) => {
      const mesure = new Mesure({
        id: im,
        statut: params[im],
        modalites: params[`modalites-${im}`],
      }, referentiel);
      depotDonnees.ajouteMesureAHomologation(requete.params.id, mesure);
    });

    reponse.send({ idHomologation: requete.params.id });
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
