const cookieSession = require('cookie-session');
const express = require('express');

const { ErreurModele } = require('./erreurs');
const AvisExpertCyber = require('./modeles/avisExpertCyber');
const CaracteristiquesComplementaires = require('./modeles/caracteristiquesComplementaires');
const Homologation = require('./modeles/homologation');
const InformationsGenerales = require('./modeles/informationsGenerales');
const InformationsHomologation = require('./modeles/informationsHomologation');
const MesureGenerale = require('./modeles/mesureGenerale');
const MesuresSpecifiques = require('./modeles/mesuresSpecifiques');
const PartiesPrenantes = require('./modeles/partiesPrenantes');
const PointAcces = require('./modeles/pointAcces');
const RisqueGeneral = require('./modeles/risqueGeneral');
const RisquesSpecifiques = require('./modeles/risquesSpecifiques');

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
    maxAge: 30 * 60 * 1000,
    name: 'token',
    sameSite: true,
    secret: process.env.SECRET_COOKIE,
    secure: avecCookieSecurise,
  }));

  app.use(middleware.positionneHeaders);
  app.use(middleware.repousseExpirationCookie);

  app.disable('x-powered-by');

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

  app.get('/initialisationMotDePasse/:idReset',
    middleware.aseptise('idReset'),
    (requete, reponse) => {
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

  app.get('/homologation/:id/decision',
    middleware.trouveHomologation,
    middleware.positionneHeadersAvecNonce,
    (requete, reponse) => {
      const { homologation, nonce } = requete;
      reponse.render('homologation/decision', { homologation, referentiel, nonce });
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
    middleware.aseptise('nomService', 'pointsAcces.*.description'),
    middleware.aseptiseListe('pointsAcces', PointAcces.proprietes()),
    (requete, reponse, suite) => {
      const {
        nomService,
        typeService,
        provenanceService,
        dejaMisEnLigne,
        fonctionnalites,
        donneesCaracterePersonnel,
        delaiAvantImpactCritique,
        presenceResponsable,
        pointsAcces,
      } = requete.body;

      depotDonnees.nouvelleHomologation(requete.idUtilisateurCourant, {
        nomService,
        typeService,
        provenanceService,
        dejaMisEnLigne,
        fonctionnalites,
        donneesCaracterePersonnel,
        delaiAvantImpactCritique,
        presenceResponsable,
        pointsAcces,
      })
        .then((idHomologation) => reponse.json({ idHomologation }))
        .catch((e) => {
          if (e instanceof ErreurModele) reponse.status(422).send(e.message);
          else suite(e);
        });
    });

  app.put('/api/homologation/:id',
    middleware.trouveHomologation,
    middleware.aseptise('nomService', 'pointsAcces.*.description'),
    middleware.aseptiseListe('pointsAcces', ['description']),
    (requete, reponse, suite) => {
      const infosGenerales = new InformationsGenerales(requete.body, referentiel);
      depotDonnees.ajouteInformationsGeneralesAHomologation(requete.params.id, infosGenerales)
        .then(() => reponse.send({ idHomologation: requete.homologation.id }))
        .catch((e) => {
          if (e instanceof ErreurModele) {
            reponse.status(422).send(e.message);
          } else suite(e);
        });
    });

  app.post('/api/homologation/:id/caracteristiquesComplementaires',
    middleware.trouveHomologation,
    middleware.aseptise('entitesExternes.*.nom', 'entitesExternes.*.contact', 'entitesExternes.*.acces'),
    (requete, reponse) => {
      requete.body.entitesExternes &&= requete.body.entitesExternes.filter(
        (e) => e && (e.nom || e.contact || e.acces)
      );
      try {
        const caracteristiques = new CaracteristiquesComplementaires(requete.body, referentiel);
        depotDonnees.ajouteCaracteristiquesAHomologation(requete.params.id, caracteristiques)
          .then(() => reponse.send({ idHomologation: requete.homologation.id }));
      } catch {
        reponse.status(422).send('Données invalides');
      }
    });

  app.post('/api/homologation/:id/mesures',
    middleware.trouveHomologation,
    middleware.aseptise(
      '*',
      'mesuresSpecifiques.*.description',
      'mesuresSpecifiques.*.categorie',
      'mesuresSpecifiques.*.statut',
      'mesuresSpecifiques.*.modalites',
    ),
    (requete, reponse, suite) => {
      const { mesuresSpecifiques = [], ...params } = requete.body;
      const identifiantsMesures = Object.keys(params).filter((p) => !p.match(/^modalites-/));
      const idHomologation = requete.homologation.id;
      try {
        const ajouts = identifiantsMesures.reduce((acc, im) => {
          const mesure = new MesureGenerale({
            id: im,
            statut: params[im],
            modalites: params[`modalites-${im}`],
          }, referentiel);

          return acc.then(
            () => depotDonnees.ajouteMesureGeneraleAHomologation(idHomologation, mesure)
          );
        }, Promise.resolve());

        ajouts
          .then(() => {
            const aPersister = mesuresSpecifiques.filter(
              (m) => m?.description || m?.categorie || m?.statut || m?.modalites
            );

            const listeMesures = new MesuresSpecifiques({
              mesuresSpecifiques: aPersister,
            }, referentiel);
            return depotDonnees.remplaceMesuresSpecifiquesPourHomologation(
              idHomologation,
              listeMesures,
            );
          })
          .then(() => reponse.send({ idHomologation }))
          .catch(suite);
      } catch {
        reponse.status(422).send('Données invalides');
      }
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
    middleware.aseptise('*', 'risquesSpecifiques.*.description', 'risquesSpecifiques.*.commentaire'),
    (requete, reponse, suite) => {
      const { risquesSpecifiques = [], ...params } = requete.body;
      const prefixeCommentaire = /^commentaire-/;
      const idHomologation = requete.homologation.id;

      try {
        const ajouts = Object.keys(params)
          .filter((p) => p.match(prefixeCommentaire))
          .reduce((acc, cr) => {
            const idRisque = cr.replace(prefixeCommentaire, '');
            const risque = new RisqueGeneral(
              { id: idRisque, commentaire: params[cr] },
              referentiel,
            );
            return acc.then(() => depotDonnees.ajouteRisqueGeneralAHomologation(
              idHomologation,
              risque,
            ));
          }, Promise.resolve());

        ajouts
          .then(() => {
            const aPersister = risquesSpecifiques.filter((r) => r?.description || r?.commentaire);
            const listeRisquesSpecifiques = new RisquesSpecifiques(
              { risquesSpecifiques: aPersister },
            );

            return depotDonnees.remplaceRisquesSpecifiquesPourHomologation(
              idHomologation, listeRisquesSpecifiques,
            );
          })
          .then(() => depotDonnees.marqueRisquesCommeVerifies(idHomologation))
          .then(() => reponse.send({ idHomologation }))
          .catch(suite);
      } catch {
        reponse.status(422).send('Données invalides');
      }
    });

  app.post('/api/homologation/:id/avisExpertCyber',
    middleware.trouveHomologation,
    (requete, reponse) => {
      try {
        const avisExpert = new AvisExpertCyber(requete.body, referentiel);
        depotDonnees.ajouteAvisExpertCyberAHomologation(requete.params.id, avisExpert)
          .then(() => reponse.send({ idHomologation: requete.params.id }));
      } catch {
        reponse.status(422).send('Données invalides');
      }
    });

  app.get('/api/seuilCriticite', middleware.verificationAcceptationCGU, (requete, reponse) => {
    const {
      fonctionnalites = [],
      donneesCaracterePersonnel = [],
      delaiAvantImpactCritique,
    } = requete.query;
    try {
      const seuilCriticite = referentiel.criticite(
        fonctionnalites, donneesCaracterePersonnel, delaiAvantImpactCritique
      );
      reponse.json({ seuilCriticite });
    } catch {
      reponse.status(422).send('Données invalides');
    }
  });

  app.post('/api/utilisateur', middleware.aseptise('prenom', 'nom', 'email'), (requete, reponse, suite) => {
    const { prenom, nom, email } = requete.body;
    depotDonnees.nouvelUtilisateur({ prenom, nom, email })
      .then((utilisateur) => (
        adaptateurMail.envoieMessageFinalisationInscription(
          utilisateur.email, utilisateur.idResetMotDePasse
        )
          .then(() => reponse.json({ idUtilisateur: utilisateur.id }))
          .catch(() => {
            depotDonnees.supprimeUtilisateur(utilisateur.id)
              .then(() => reponse.status(424).send(
                "L'envoi de l'email de finalisation d'inscription a échoué"
              ));
          })
      ))
      .catch((e) => {
        if (e instanceof ErreurModele) reponse.status(422).send(e.message);
        else suite(e);
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
