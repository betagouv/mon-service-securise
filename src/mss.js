const cookieSession = require('cookie-session');
const express = require('express');

const { ErreurUtilisateurExistant } = require('./erreurs');
const AvisExpertCyber = require('./modeles/avisExpertCyber');
const CaracteristiquesComplementaires = require('./modeles/caracteristiquesComplementaires');
const Homologation = require('./modeles/homologation');
const InformationsGenerales = require('./modeles/informationsGenerales');
const InformationsHomologation = require('./modeles/informationsHomologation');
const Mesure = require('./modeles/mesure');
const PartiesPrenantes = require('./modeles/partiesPrenantes');
const Risque = require('./modeles/risque');

require('dotenv').config();

const creeServeur = (depotDonnees, middleware, referentiel, adaptateurMail,
  avecCookieSecurise = (process.env.NODE_ENV === 'production')) => {
  let serveur;

  const sersFormulaireEditionUtilisateur = (requete, reponse) => {
    middleware.verificationJWT(requete, reponse, () => {
      const idUtilisateur = requete.idUtilisateurCourant;
      depotDonnees.utilisateur(idUtilisateur)
        .then((utilisateur) => reponse.render('utilisateur/edition', { utilisateur }));
    });
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

  app.get('/reinitialisationMotDePasse', middleware.suppressionCookie, (requete, reponse) => {
    reponse.render('reinitialisationMotDePasse');
  });

  app.get('/inscription', (requete, reponse) => {
    reponse.render('inscription');
  });

  app.get('/initialisationMotDePasse/:idReset', (requete, reponse) => {
    const { idReset } = requete.params;
    depotDonnees.utilisateurAFinaliser(idReset)
      .then((utilisateur) => {
        if (!utilisateur) {
          reponse.status(404)
            .send(`Identifiant d'initialisation de mot de passe "${idReset}" inconnu`);
        } else {
          const token = utilisateur.genereToken();
          requete.session.token = token;
          sersFormulaireEditionUtilisateur(requete, reponse);
        }
      });
  });

  app.get('/admin/inscription', middleware.authentificationBasique, (requete, reponse) => {
    reponse.render('admin/inscription');
  });

  app.get('/homologations', middleware.verificationAcceptationCGU, (requete, reponse) => {
    reponse.render('homologations');
  });

  app.get('/homologation/creation', middleware.verificationAcceptationCGU, (requete, reponse) => {
    const homologation = new Homologation({});
    reponse.render('homologation/creation', { referentiel, homologation });
  });

  app.get('/homologation/:id', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    const actionsDeSaisie = {
      'Décrivez le service numérique': [{
        description: 'Informations générales',
        url: `/homologation/${homologation.id}/edition`,
        statut: homologation.statutSaisie('informationsGenerales'),
      }, {
        description: 'Caractéristiques complémentaires',
        url: `/homologation/${homologation.id}/caracteristiquesComplementaires`,
        statut: homologation.statutSaisie('caracteristiquesComplementaires'),
      }, {
        description: 'Parties prenantes',
        url: `/homologation/${homologation.id}/partiesPrenantes`,
        statut: homologation.statutSaisie('partiesPrenantes'),
      }],

      'Sécurisez le service numérique': [{
        description: 'Risques de sécurité',
        url: `/homologation/${homologation.id}/risques`,
        statut: homologation.statutSaisie('risques'),
      }, {
        description: 'Mesures de sécurité',
        url: `/homologation/${homologation.id}/mesures`,
        statut: homologation.statutSaisie('mesures'),
      }],

      'Complétez le dossier': [{
        description: "Avis de l'expert cyber",
        url: `/homologation/${homologation.id}/avisExpertCyber`,
        statut: homologation.statutSaisie('avisExpertCyber'),
      }],
    };
    reponse.render('homologation', { homologation, actionsDeSaisie, InformationsHomologation });
  });

  app.get('/homologation/:id/caracteristiquesComplementaires',
    middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/caracteristiquesComplementaires', { referentiel, homologation });
    });

  app.get('/homologation/:id/decision', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/decision', { homologation, referentiel });
  });

  app.get('/homologation/:id/edition', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/edition', { referentiel, homologation });
  });

  app.get('/homologation/:id/mesures', middleware.trouveHomologation, (requete, reponse) => {
    const { homologation } = requete;
    reponse.render('homologation/mesures', { referentiel, homologation });
  });

  app.get('/homologation/:id/partiesPrenantes',
    middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/partiesPrenantes', { homologation });
    });

  app.get('/homologation/:id/risques',
    middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/risques', { referentiel, homologation });
    });

  app.get('/homologation/:id/avisExpertCyber',
    middleware.trouveHomologation,
    (requete, reponse) => {
      const { homologation } = requete;
      reponse.render('homologation/avisExpertCyber', { referentiel, homologation });
    });

  app.get('/utilisateur/edition', (requete, reponse) => {
    sersFormulaireEditionUtilisateur(requete, reponse);
  });

  app.get('/api/homologations', middleware.verificationAcceptationCGU, (requete, reponse) => {
    depotDonnees.homologations(requete.idUtilisateurCourant)
      .then((homologations) => homologations.map((h) => h.toJSON()))
      .then((homologations) => reponse.json({ homologations }));
  });

  app.post('/api/homologation',
    middleware.verificationAcceptationCGU,
    middleware.aseptise('nomService'),
    (requete, reponse) => {
      if (typeof requete.body.nomService === 'string' && requete.body.nomService) {
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

        depotDonnees.nouvelleHomologation(requete.idUtilisateurCourant, {
          nomService,
          natureService,
          provenanceService,
          dejaMisEnLigne,
          fonctionnalites,
          donneesCaracterePersonnel,
          delaiAvantImpactCritique,
          presenceResponsable,
        })
          .then((idHomologation) => reponse.json({ idHomologation }));
      } else reponse.status(422).send("Données insuffisantes pour créer l'homologation");
    });

  app.put('/api/homologation/:id',
    middleware.trouveHomologation,
    middleware.aseptise('nomService'),
    (requete, reponse) => {
      const infosGenerales = new InformationsGenerales(requete.body, referentiel);
      depotDonnees.ajouteInformationsGeneralesAHomologation(requete.params.id, infosGenerales)
        .then(() => reponse.send({ idHomologation: requete.homologation.id }))
        .catch(() => reponse.status(422).send(
          "Données insuffisantes pour mettre à jour l'homologation"
        ));
    });

  app.post('/api/homologation/:id/caracteristiquesComplementaires',
    middleware.trouveHomologation,
    middleware.aseptise('entitesExternes.*.nom', 'entitesExternes.*.role'),
    (requete, reponse) => {
      requete.body.entitesExternes &&= requete.body.entitesExternes.filter(
        (e) => e && (e.nom || e.role)
      );
      const caracteristiques = new CaracteristiquesComplementaires(requete.body, referentiel);
      depotDonnees.ajouteCaracteristiquesAHomologation(requete.params.id, caracteristiques)
        .then(() => reponse.send({ idHomologation: requete.homologation.id }));
    });

  app.post('/api/homologation/:id/mesures',
    middleware.trouveHomologation,
    middleware.aseptiseTout,
    (requete, reponse) => {
      const params = requete.body;
      const identifiantsMesures = Object.keys(params).filter((p) => !p.match(/^modalites-/));
      let ajouts = Promise.resolve();
      identifiantsMesures.forEach((im) => {
        const mesure = new Mesure({
          id: im,
          statut: params[im],
          modalites: params[`modalites-${im}`],
        }, referentiel);

        ajouts = ajouts.then(
          () => depotDonnees.ajouteMesureAHomologation(requete.homologation.id, mesure)
        );
      });

      ajouts.then(() => reponse.send({ idHomologation: requete.homologation.id }));
    });

  app.post('/api/homologation/:id/partiesPrenantes',
    middleware.trouveHomologation,
    (requete, reponse) => {
      const partiesPrenantes = new PartiesPrenantes(requete.body);
      depotDonnees.ajoutePartiesPrenantesAHomologation(requete.homologation.id, partiesPrenantes)
        .then(() => reponse.send({ idHomologation: requete.homologation.id }));
    });

  app.post('/api/homologation/:id/risques',
    middleware.trouveHomologation,
    middleware.aseptiseTout,
    (requete, reponse, suite) => {
      const params = requete.body;
      const prefixeCommentaire = /^commentaire-/;
      const commentairesRisques = Object.keys(params).filter((p) => p.match(prefixeCommentaire));

      let ajouts = Promise.resolve();
      commentairesRisques.forEach((cr) => {
        const idRisque = cr.replace(prefixeCommentaire, '');
        const risque = new Risque({ id: idRisque, commentaire: params[cr] }, referentiel);
        ajouts = ajouts.then(
          () => depotDonnees.ajouteRisqueAHomologation(requete.homologation.id, risque)
        );
      });

      ajouts
        .then(() => depotDonnees.marqueRisquesCommeVerifies(requete.homologation.id))
        .then(() => reponse.send({ idHomologation: requete.homologation.id }))
        .catch(suite);
    });

  app.post('/api/homologation/:id/avisExpertCyber',
    middleware.trouveHomologation,
    (requete, reponse) => {
      const avisExpert = new AvisExpertCyber(requete.body, referentiel);
      depotDonnees.ajouteAvisExpertCyberAHomologation(requete.params.id, avisExpert)
        .then(() => reponse.send({ idHomologation: requete.params.id }));
    });

  app.get('/api/seuilCriticite', middleware.verificationAcceptationCGU, (requete, reponse) => {
    const {
      fonctionnalites = [],
      donneesCaracterePersonnel = [],
      delaiAvantImpactCritique,
    } = requete.query;
    const seuilCriticite = referentiel.criticite(
      fonctionnalites, donneesCaracterePersonnel, delaiAvantImpactCritique
    );
    reponse.json({ seuilCriticite });
  });

  app.post('/api/utilisateur', middleware.aseptise('prenom', 'nom', 'email'), (requete, reponse) => {
    const { prenom, nom, email } = requete.body;
    depotDonnees.nouvelUtilisateur({ prenom, nom, email })
      .then((utilisateur) => {
        adaptateurMail.envoieMessageFinalisationInscription(
          utilisateur.email, utilisateur.idResetMotDePasse
        );
        const idUtilisateur = utilisateur.id;
        reponse.json({ idUtilisateur });
      }, (e) => {
        if (e instanceof ErreurUtilisateurExistant) {
          reponse.status(422).send('Utilisateur déjà existant pour cette adresse email');
        } else throw e;
      });
  });

  app.post('/api/reinitialisationMotDePasse', (requete, reponse, suite) => {
    const { email } = requete.body;
    depotDonnees.reinitialiseMotDePasse(email)
      .then((utilisateur) => {
        if (utilisateur) {
          adaptateurMail.envoieMessageReinitialisationMotDePasse(
            utilisateur.email, utilisateur.idResetMotDePasse
          );
        }
      })
      .then(() => reponse.send(''))
      .catch(suite);
  });

  app.put('/api/utilisateur', middleware.verificationJWT, (requete, reponse, suite) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    depotDonnees.utilisateur(idUtilisateur)
      .then((utilisateur) => {
        const { motDePasse, cguAcceptees } = requete.body;

        if (typeof motDePasse !== 'string' || !motDePasse) {
          reponse.status(422).send('Le mot de passe ne doit pas être une chaîne vide');
        } else if (!utilisateur.accepteCGU() && !cguAcceptees) {
          reponse.status(422).send('CGU non acceptées');
        } else {
          depotDonnees.metsAJourMotDePasse(idUtilisateur, motDePasse)
            .then(depotDonnees.valideAcceptationCGUPourUtilisateur)
            .then(depotDonnees.supprimeIdResetMotDePassePourUtilisateur)
            .then((u) => {
              const token = u.genereToken();
              requete.session.token = token;
              reponse.json({ idUtilisateur });
            })
            .catch(suite);
        }
      });
  });

  app.get('/api/utilisateurCourant', middleware.verificationJWT, (requete, reponse) => {
    const idUtilisateur = requete.idUtilisateurCourant;
    if (idUtilisateur) {
      depotDonnees.utilisateur(idUtilisateur)
        .then((utilisateur) => {
          reponse.json({ utilisateur: utilisateur.toJSON() });
        });
    } else reponse.status(401).send("Pas d'utilisateur courant");
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
          reponse.status(401).send("L'authentification a échoué");
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
