import express from 'express';
import { valideBody } from '../../http/validePayloads.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { schemaPostConsentementPixelDeSuivi } from './routesNonConnecteWebhooks.schema.js';

/* eslint-disable no-underscore-dangle */

const routesNonConnecteWebhooks = ({
  middleware,
  depotDonnees,
}: {
  middleware: Middleware;
  depotDonnees: DepotDonnees;
}) => {
  const routes = express.Router();

  routes.post(
    '/updateConsentementPixelDeSuivi',
    middleware.verificationAddresseIP(['1.179.112.0/20', '172.246.240.0/20']),
    valideBody(schemaPostConsentementPixelDeSuivi),
    async (requete, reponse) => {
      const { email } = requete.body;
      const pixelDeSuiviAccepte =
        requete.body.content[0].attributes._PIXEL_TRACKING_CONSENT;

      const concerneAutreChoseQueLePixel = pixelDeSuiviAccepte === undefined;
      if (concerneAutreChoseQueLePixel) {
        reponse.sendStatus(204);
        return;
      }

      const utilisateur = await depotDonnees.utilisateurAvecEmail(email);
      if (!utilisateur) {
        reponse.status(424).json({ erreur: `L'email fourni est introuvable` });
        return;
      }

      await depotDonnees.metsAJourUtilisateur(utilisateur.id, {
        pixelDeSuiviAccepte,
      });

      reponse.sendStatus(200);
    }
  );

  return routes;
};

export default routesNonConnecteWebhooks;
