const express = require('express');
const uuid = require('uuid');
const { estUrlLegalePourRedirection } = require('../../http/redirection');
const CmsCrisp = require('../../cms/cmsCrisp');
const { ErreurArticleCrispIntrouvable } = require('../../erreurs');
const SourceAuthentification = require('../../modeles/sourceAuthentification');

const routesNonConnectePage = ({
  adaptateurCmsCrisp,
  adaptateurEnvironnement,
  adaptateurStatistiques,
  adaptateurJWT,
  adaptateurProfilAnssi,
  serviceAnnuaire,
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

    if (!token) {
      reponse.sendStatus(400);
      return;
    }

    let donneesUtilisateur;
    try {
      donneesUtilisateur = adaptateurJWT.decode(token);
    } catch (e) {
      reponse.sendStatus(400);
      return;
    }

    const { prenom, nom, email, siret, invite } = donneesUtilisateur;

    const profilAnssi = await adaptateurProfilAnssi.recupere(email);

    let organisation;
    let telephone;
    let domainesSpecialite;
    if (profilAnssi) {
      ({ telephone, domainesSpecialite, organisation } = profilAnssi);
    }

    if (siret) {
      const organisations = await serviceAnnuaire.rechercheOrganisations(siret);
      if (organisations.length > 0)
        organisation = {
          siret,
          departement: organisations[0].departement,
          nom: organisations[0].nom,
        };
    }
    reponse.render('creation-compte', {
      estimationNombreServices: referentiel.estimationNombreServices(),
      informationsProfessionnelles: {
        prenom,
        nom,
        email,
        organisation,
        telephone,
        domainesSpecialite,
      },
      departements: referentiel.departements(),
      invite: !!invite,
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

      serviceGestionnaireSession.enregistreSession(
        requete,
        utilisateur,
        SourceAuthentification.MSS
      );

      reponse.render('motDePasse/edition', {
        utilisateur,
        enModeInitialisation: true,
      });
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

  routes.get('/ui-kit', (_requete, reponse) => {
    reponse.render('uiKit');
  });

  return routes;
};

module.exports = routesNonConnectePage;
