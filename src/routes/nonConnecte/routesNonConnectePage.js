const express = require('express');
const uuid = require('uuid');
const {
  estUrlLegalePourRedirection,
  construisUrlAbsolueVersPage,
} = require('../../http/redirection');
const CmsCrisp = require('../../cms/cmsCrisp');
const { ErreurArticleCrispIntrouvable } = require('../../erreurs');

const routesNonConnectePage = ({
  adaptateurCmsCrisp,
  depotDonnees,
  middleware,
  referentiel,
}) => {
  const routes = express.Router();

  routes.get('/', (_requete, reponse) => {
    reponse.render('home');
  });

  routes.get('/aPropos', (_requete, reponse) => {
    reponse.render('aPropos');
  });

  routes.get('/securite', (_requete, reponse) => {
    reponse.render('securite');
  });

  routes.get('/accessibilite', (_requete, reponse) => {
    reponse.render('accessibilite');
  });

  routes.get('/cgu', (_requete, reponse) => {
    reponse.render('cgu');
  });

  routes.get('/confidentialite', (_requete, reponse) => {
    reponse.render('confidentialite');
  });

  routes.get('/mentionsLegales', (_requete, reponse) => {
    reponse.render('mentionsLegales');
  });

  routes.get('/statistiques', (_requete, reponse) => {
    reponse.render('statistiques');
  });

  routes.get('/inscription', (_requete, reponse) => {
    const departements = referentiel.departements();
    reponse.render('inscription', { departements, referentiel });
  });

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

    reponse.render('connexion', {
      urlRedirection: construisUrlAbsolueVersPage(urlRedirection),
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

      requete.session.token = utilisateur.genereToken();
      reponse.render('motDePasse/edition', { utilisateur });
    }
  );

  routes.get(
    '/devenir-ambassadeurrice-monservicesecurise',
    async (_requete, reponse) => {
      const cmsCrisp = new CmsCrisp({ adaptateurCmsCrisp });
      const donneesArticle = await cmsCrisp.recupereDevenirAmbassadeur();

      reponse.render('article', {
        ...donneesArticle,
        avecTitreTableDesMatieres: false,
        ongletActif: 'promouvoir-monservicesecurise',
      });
    }
  );

  routes.get(
    '/faire-connaitre-et-recommander-monservicesecurise',
    async (_requete, reponse) => {
      const cmsCrisp = new CmsCrisp({ adaptateurCmsCrisp });
      const donneesArticle = await cmsCrisp.recupereFaireConnaitre();

      reponse.render('article', {
        ...donneesArticle,
        avecTitreTableDesMatieres: false,
        ongletActif: 'promouvoir-monservicesecurise',
      });
    }
  );

  routes.get('/promouvoir-monservicesecurise', async (_requete, reponse) => {
    const cmsCrisp = new CmsCrisp({ adaptateurCmsCrisp });
    const donneesArticle = await cmsCrisp.recuperePromouvoir();

    reponse.render('article', {
      ...donneesArticle,
      avecTitreTableDesMatieres: false,
      ongletActif: 'promouvoir-monservicesecurise',
    });
  });

  routes.get('/co-construire-monservicesecurise', async (_requete, reponse) => {
    const cmsCrisp = new CmsCrisp({ adaptateurCmsCrisp });
    const donneesArticle = await cmsCrisp.recupereRoadmap();

    reponse.render('article', {
      ...donneesArticle,
      avecTitreTableDesMatieres: false,
      ongletActif: 'co-construire-monservicesecurise',
    });
  });

  routes.get('/articles/:slug', async (requete, reponse, suite) => {
    try {
      const cmsCrisp = new CmsCrisp({ adaptateurCmsCrisp });
      const article = await cmsCrisp.recupereArticleBlog(requete.params.slug);
      reponse.render('article', {
        ...article,
        avecTitreTableDesMatieres: true,
        avecFilAriane: true,
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
    const cmsCrisp = new CmsCrisp({ adaptateurCmsCrisp });
    const sections = await cmsCrisp.recupereSectionsBlog();
    const articles = await cmsCrisp.recupereArticlesBlog();
    reponse.render('conseilsCyber', { sections, articles });
  });

  routes.get('/sitemap.xml', async (_requete, reponse) => {
    reponse.sendFile('/public/assets/fichiers/sitemap.xml', { root: '.' });
  });

  return routes;
};

module.exports = routesNonConnectePage;
