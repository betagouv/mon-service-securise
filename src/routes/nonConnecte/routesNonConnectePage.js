const express = require('express');
const uuid = require('uuid');
const {
  estUrlLegalePourRedirection,
  construisUrlAbsolueVersPage,
} = require('../../http/redirection');
const CmsCrisp = require('../../cms/cmsCrisp');

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
      const { titre, contenu } = await cmsCrisp.recupereDevenirAmbassadeur();

      reponse.render('article', { titre, contenu });
    }
  );

  routes.get('/sitemap.xml', async (_requete, reponse) => {
    reponse.sendFile('/public/assets/fichiers/sitemap.xml', { root: '.' });
  });

  return routes;
};

module.exports = routesNonConnectePage;
