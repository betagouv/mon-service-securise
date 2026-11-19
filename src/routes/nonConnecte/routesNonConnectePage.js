import express from 'express';
import { readFileSync } from 'node:fs';
import { ErreurArticleCrispIntrouvable } from '@lab-anssi/lib';
import { estUrlLegalePourRedirection } from '../../http/redirection.js';
import { knexMSS } from '../../bdd/knex.js';

const routesNonConnectePage = ({
  adaptateurEnvironnement,
  adaptateurStatistiques,
  adaptateurJWT,
  cmsCrisp,
  middleware,
  referentiel,
  referentielV2,
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

  routes.get('/industrialisez-vos-homologations', (_requete, reponse) => {
    reponse.render('industrialisezHomologations');
  });

  routes.get('/securisez-votre-service-numerique', (_requete, reponse) => {
    reponse.render('securisezServiceNumerique');
  });

  routes.get('/formez-vous', (_requete, reponse) => {
    reponse.render('formezVous');
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
    } catch {
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

  routes.get('/referentiel-mesures', async (_requete, reponse) => {
    reponse.render('referentielMesures', {
      mesuresV2: referentielV2.mesures(),
      referentiel: referentielV2,
    });
  });

  const sitemap = readFileSync('./public/assets/fichiers/sitemap.xml', 'utf8');
  const robots = readFileSync('./public/assets/fichiers/robots.txt', 'utf8');
  const llms = readFileSync('./public/assets/fichiers/llms.txt', 'utf8');

  routes.get('/sitemap.xml', async (_requete, reponse) => {
    reponse.type('application/xml').send(sitemap);
  });

  routes.get('/robots.txt', async (_requete, reponse) => {
    reponse.type('text/plain').send(robots);
  });

  routes.get('/llms.txt', async (_requete, reponse) => {
    reponse.type('text/markdown').send(llms);
  });

  routes.get('/observatoire', async (_requete, reponse) => {
    const totalServices = (
      await knexMSS('observatoire_mss_services_crees').count()
    )[0].count;

    const { rows: cumulMensuelServices } = await knexMSS.raw(`
      WITH bornes AS (
        SELECT date_trunc('month', MIN(date_creation)) AS premier_mois,
               date_trunc('month', MAX(date_creation)) AS dernier_mois
        FROM observatoire_mss_services_crees
      ),
      mois AS (
        SELECT generate_series(premier_mois, dernier_mois, interval '1 month') AS mois
        FROM bornes
      ),
      crees_par_mois AS (
        SELECT date_trunc('month', date_creation) AS mois, COUNT(*) AS nombre
        FROM observatoire_mss_services_crees
        WHERE date_creation IS NOT NULL
        GROUP BY 1
      )
      SELECT to_char(mois.mois, 'YYYY-MM') AS mois,
             (SUM(COALESCE(crees_par_mois.nombre, 0)) OVER (ORDER BY mois.mois))::int AS cumul
      FROM mois
      LEFT JOIN crees_par_mois ON crees_par_mois.mois = mois.mois
      ORDER BY mois.mois
    `);

    const { rows: mesuresFaitesParMois } = await knexMSS.raw(`
      SELECT to_char(date - interval '1 month', 'YYYY-MM') AS mois,
             SUM(total_faites)::int AS total
      FROM observatoire_mss_mesures_faites
      GROUP BY date
      ORDER BY date
    `);

    const { rows: servicesParNiveauSecurite } = await knexMSS.raw(`
      SELECT niveau_securite AS "niveauSecurite",
             COUNT(*)::int AS total
      FROM observatoire_mss_services_crees
      WHERE niveau_securite IS NOT NULL
      GROUP BY niveau_securite
      ORDER BY CASE niveau_securite
                 WHEN 'Élémentaires' THEN 1
                 WHEN 'Modérés' THEN 2
                 WHEN 'Importants' THEN 3
               END
    `);

    const { rows: cumulMensuelHomologations } = await knexMSS.raw(`
      SELECT to_char(date - interval '1 month', 'YYYY-MM') AS mois,
             SUM(total_realisees)::int AS cumul
      FROM observatoire_mss_homologations_realisees
      GROUP BY date
      ORDER BY date
    `);

    const [{ derniereExecution }] = await knexMSS(
      'observatoire_mss_executions'
    ).max('date_execution as derniereExecution');

    reponse.render('observatoire', {
      donneesObservatoire: {
        totalServices,
        cumulMensuelServices,
        mesuresFaitesParMois,
        servicesParNiveauSecurite,
        cumulMensuelHomologations,
        dateDerniereExecution: derniereExecution,
      },
    });
  });
  return routes;
};

export default routesNonConnectePage;
