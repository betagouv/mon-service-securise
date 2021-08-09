const cookieSession = require('cookie-session');
const express = require('express');

const { ErreurUtilisateurExistant } = require('./erreurs');
const AvisExpertCyber = require('./modeles/avisExpertCyber');
const CaracteristiquesComplementaires = require('./modeles/caracteristiquesComplementaires');
const Homologation = require('./modeles/homologation');
const Mesure = require('./modeles/mesure');
const PartiesPrenantes = require('./modeles/partiesPrenantes');
const Risque = require('./modeles/risque');

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

  app.get('/aPropos', (requete, reponse) => {
    reponse.render('aPropos');
  });

  app.get('/cgu', (requete, reponse) => {
    reponse.render('cgu');
  });

  app.get('/confidentialite', (requete, reponse) => {
    reponse.render('confidentialite');
  });

  app.get('/connexion', middleware.suppressionCookie, (requete, reponse) => {
    reponse.render('connexion');
  });

  app.get('/doisJeHomologuer', (requete, reponse) => {
    reponse.render('doisJeHomologuer');
  });

  app.get('/mentionsLegales', (requete, reponse) => {
    reponse.render('mentionsLegales');
  });

  app.get('/inscription', (requete, reponse) => {
    reponse.render('inscription');
  });

  app.get('/admin/inscription', middleware.authentificationBasique, (requete, reponse) => {
    reponse.render('admin/inscription');
  });

  app.get('/homologations', middleware.verificationJWT, (requete, reponse) => {
    reponse.render('homologations');
  });

  app.get('/homologation/creation', middleware.verificationJWT, (requete, reponse) => {
    const homologation = new Homologation({});
    reponse.render('homologation/creation', { referentiel, homologation });
  });

  app.get('/homologation/:id',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation', { homologation });
    });

  app.get('/homologation/:id/caracteristiquesComplementaires',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/caracteristiquesComplementaires', { referentiel, homologation });
    });

  app.get('/homologation/:id/decision',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/decision', { Homologation, homologation, referentiel });
    });

  app.get('/homologation/:id/edition',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/edition', { referentiel, homologation });
    });

  app.get('/homologation/:id/mesures',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/mesures', { referentiel, homologation });
    });

  app.get('/homologation/:id/partiesPrenantes',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/partiesPrenantes', { homologation });
    });

  app.get('/homologation/:id/risques',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/risques', { referentiel, homologation });
    });

  app.get('/homologation/:id/avisExpertCyber',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/avisExpertCyber', { referentiel, homologation });
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

  app.put('/api/homologation/:id',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
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

      const idHomologation = depotDonnees.metsAJourHomologation(requete.homologation.id, {
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
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const caracteristiques = new CaracteristiquesComplementaires(requete.body, referentiel);
      depotDonnees.ajouteCaracteristiquesAHomologation(requete.params.id, caracteristiques);

      reponse.send({ idHomologation: requete.homologation.id });
    });

  app.post('/api/homologation/:id/mesures',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const params = requete.body;
      const identifiantsMesures = Object.keys(params).filter((p) => !p.match(/^modalites-/));
      identifiantsMesures.forEach((im) => {
        const mesure = new Mesure({
          id: im,
          statut: params[im],
          modalites: params[`modalites-${im}`],
        }, referentiel);
        depotDonnees.ajouteMesureAHomologation(requete.homologation.id, mesure);
      });

      reponse.send({ idHomologation: requete.homologation.id });
    });

  app.post('/api/homologation/:id/partiesPrenantes',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const partiesPrenantes = new PartiesPrenantes(requete.body);
      depotDonnees.ajoutePartiesPrenantesAHomologation(requete.homologation.id, partiesPrenantes);

      reponse.send({ idHomologation: requete.homologation.id });
    });

  app.post('/api/homologation/:id/risques',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const params = requete.body;
      const prefixeCommentaire = /^commentaire-/;
      const commentairesRisques = Object.keys(params).filter((p) => p.match(prefixeCommentaire));
      commentairesRisques.forEach((cr) => {
        const idRisque = cr.replace(prefixeCommentaire, '');
        const risque = new Risque({ id: idRisque, commentaire: params[cr] }, referentiel);

        depotDonnees.ajouteRisqueAHomologation(requete.homologation.id, risque);
      });

      reponse.send({ idHomologation: requete.homologation.id });
    });

  app.post('/api/homologation/:id/avisExpertCyber',
    middleware.verificationJWT, middleware.trouveHomologation,
    (requete, reponse) => {
      const avisExpert = new AvisExpertCyber(requete.body, referentiel);
      depotDonnees.ajouteAvisExpertCyberAHomologation(requete.params.id, avisExpert);
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
