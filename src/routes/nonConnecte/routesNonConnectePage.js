import express from 'express';
import * as uuid from 'uuid';
import { ErreurArticleCrispIntrouvable } from '@lab-anssi/lib';
import { estUrlLegalePourRedirection } from '../../http/redirection.js';
import { SourceAuthentification } from '../../modeles/sourceAuthentification.js';

const { MSS } = SourceAuthentification;

const routesNonConnectePage = ({
  adaptateurEnvironnement,
  adaptateurStatistiques,
  adaptateurJWT,
  cmsCrisp,
  depotDonnees,
  middleware,
  referentiel,
  serviceGestionnaireSession,
}) => {
  const routes = express.Router();

  routes.get('/', (_requete, reponse) => {
    reponse.render('home');
  });

  routes.get('/aPropos', (_requete, reponse) => {
    reponse.render('aPropos');
  });

  routes.get('/doctrine-homologation-anssi', (_requete, reponse) => {
    reponse.render('doctrineHomologation');
  });

  routes.get('/securite', (_requete, reponse) => {
    reponse.render('securite');
  });

  routes.get('/accessibilite', (_requete, reponse) => {
    reponse.render('accessibilite');
  });

  routes.get('/cgu', (requete, reponse) => {
    const cguAcceptees = serviceGestionnaireSession.cguAcceptees(requete);
    const demandeAcceptation =
      cguAcceptees === undefined ? false : !cguAcceptees;
    reponse.render('cgu', { demandeAcceptation });
  });

  routes.get('/confidentialite', (_requete, reponse) => {
    reponse.render('confidentialite');
  });

  routes.get('/mentionsLegales', (_requete, reponse) => {
    reponse.render('mentionsLegales');
  });

  routes.get('/statistiques', async (_requete, reponse) => {
    const { utilisateurs, services, vulnerabilites, indiceCyber } =
      await adaptateurStatistiques.recupereStatistiques();

    reponse.render('statistiques', {
      utilisateurs,
      services,
      vulnerabilites,
      indiceCyber,
    });
  });

  routes.get('/creation-compte', async (requete, reponse) => {
    const { token } = requete.query;

    let informationsProfessionnelles;
    try {
      informationsProfessionnelles = adaptateurJWT.decode(token);
    } catch (e) {
      reponse.sendStatus(400);
      return;
    }

    const { invite } = informationsProfessionnelles;

    reponse.render('creation-compte', {
      estimationNombreServices: referentiel.estimationNombreServices(),
      informationsProfessionnelles,
      departements: referentiel.departements(),
      invite: !!invite,
      token,
    });
  });

  routes.get(
    '/inscription',
    middleware.suppressionCookie,
    (requete, reponse) => {
      const { invite } = requete.query;
      reponse.render('accueilInscription.pug', { invite: !!invite });
    }
  );

  routes.get('/activation', (_requete, reponse) => {
    reponse.render('activation');
  });

  routes.get('/connexion', middleware.suppressionCookie, (requete, reponse) => {
    const { urlRedirection } = requete.query;
    if (!urlRedirection) {
      reponse.render('connexion');
      return;
    }
    if (!estUrlLegalePourRedirection(urlRedirection)) {
      // Ici c'est un redirect, pour nettoyer l'URL de la redirection invalide.
      reponse.redirect('connexion');
      return;
    }
    const urlRedirectionAvecBase = `${adaptateurEnvironnement
      .mss()
      .urlBase()}${urlRedirection}`;
    reponse.render('connexion', {
      urlRedirection: urlRedirectionAvecBase,
    });
  });

  routes.get(
    '/reinitialisationMotDePasse',
    middleware.suppressionCookie,
    (_requete, reponse) => {
      reponse.render('reinitialisationMotDePasse');
    }
  );

  routes.get(
    '/initialisationMotDePasse/:idReset',
    middleware.aseptise('idReset'),
    middleware.chargeEtatAgentConnect,
    async (requete, reponse) => {
      const { idReset } = requete.params;

      const pasUnUUID = !uuid.validate(idReset);
      if (pasUnUUID) {
        reponse.status(400).send(`UUID requis`);
        return;
      }

      const utilisateur = await depotDonnees.utilisateurAFinaliser(idReset);
      if (!utilisateur) {
        reponse
          .status(404)
          .send(`Identifiant d'initialisation de mot de passe inconnu`);
        return;
      }

      if (utilisateur.estUnInvite()) {
        reponse.redirect('/inscription');
        return;
      }

      serviceGestionnaireSession.enregistreSession(requete, utilisateur, MSS);

      reponse.render('motDePasse/edition', {
        utilisateur,
        enModeInitialisation: true,
      });
    }
  );

  routes.get(
    '/devenir-ambassadeurrice-monservicesecurise',
    async (_requete, reponse) => {
      const donneesArticle = await cmsCrisp.recupereDevenirAmbassadeur();
      reponse.render('article', {
        ...donneesArticle,
        ongletActif: 'promouvoir/devenir-ambassadeurrice',
      });
    }
  );

  routes.get(
    '/faire-connaitre-et-recommander-monservicesecurise',
    async (_requete, reponse) => {
      const donneesArticle = await cmsCrisp.recupereFaireConnaitre();

      reponse.render('article', {
        ...donneesArticle,
        ongletActif: 'promouvoir/faire-connaitre',
      });
    }
  );

  routes.get('/co-construire-monservicesecurise', async (_requete, reponse) => {
    const donneesArticle = await cmsCrisp.recupereRoadmap();

    reponse.render('article', {
      ...donneesArticle,
      ongletActif: 'co-construire-monservicesecurise',
    });
  });

  routes.get('/articles/:slug', async (requete, reponse, suite) => {
    try {
      const article = await cmsCrisp.recupereArticleBlog(requete.params.slug);
      reponse.render('article', {
        ...article,
        masqueDescription: true,
        ongletActif: 'conseils-cyber',
      });
    } catch (e) {
      if (e instanceof ErreurArticleCrispIntrouvable) {
        reponse.status(404).send(`Article Crisp inconnu`);
        return;
      }
      suite(e);
    }
  });

  routes.get('/conseils-cyber', async (_requete, reponse) => {
    const sections = await cmsCrisp.recupereSectionsBlog();
    const articles = await cmsCrisp.recupereArticlesBlog();
    reponse.render('conseilsCyber', { sections, articles });
  });

  routes.get('/sitemap.xml', async (_requete, reponse) => {
    reponse.sendFile('/public/assets/fichiers/sitemap.xml', { root: '.' });
  });

  routes.get('/ui-kit', (_requete, reponse) => {
    reponse.render('uiKit');
  });

  return routes;
};

export default routesNonConnectePage;
