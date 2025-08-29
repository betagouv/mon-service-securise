import axios from 'axios';
import express from 'express';
import { matomo } from '../../adaptateurs/adaptateurEnvironnement.js';

const CHEMINS_BIBLIOTHEQUES = {
  get: {
    'matomo-tag-manager.js': matomo().urlTagManager(),
    'matomo.js': 'https://stats.beta.gouv.fr/matomo.js',
  },
  post: {
    evenementMatomo: 'https://stats.beta.gouv.fr/matomo.php',
  },
};

const CSP_BIBLIOTHEQUES = {
  matomo: { connect: 'https://stats.beta.gouv.fr/matomo.php' },
  crisp: { image: 'https://storage.crisp.chat' },
  monservicesecurise: {
    media:
      'https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com',
  },
  'lab-anssi-ui-kit': {
    img: 'https://lab-anssi-ui-kit-prod-s3-assets.cellar-c2.services.clever-cloud.com',
  },
};

const routesNonConnecteApiBibliotheques = () => {
  const routes = express.Router();

  const ajouteRoutes = (methode) =>
    routes[methode]('/:nomBibliotheque', async (requete, reponse) => {
      const { nomBibliotheque } = requete.params;
      const chemin = CHEMINS_BIBLIOTHEQUES[methode][nomBibliotheque];

      if (!chemin) {
        reponse.status(404).send(`Bibliothèque inconnue : ${nomBibliotheque}`);
        return;
      }

      try {
        const reponseServeur = await axios[methode](
          chemin,
          {},
          { params: requete.query }
        );

        reponse
          .status(reponseServeur.status)
          .type('text/javascript')
          .send(reponseServeur.data);
      } catch (e) {
        const details = JSON.stringify(e.toJSON());
        // eslint-disable-next-line no-console
        console.error(
          `[ERREUR] Bibliothèque [${methode}] ${chemin}\n${details}`
        );
        reponse.sendStatus(400);
      }
    });

  Object.keys(CHEMINS_BIBLIOTHEQUES).forEach(ajouteRoutes);

  return routes;
};

export { routesNonConnecteApiBibliotheques, CSP_BIBLIOTHEQUES };
