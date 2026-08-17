import express from 'express';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { schemaPostConsentementPixelDeSuivi } from './routesNonConnecteWebhooks.schema.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';

/* eslint-disable no-underscore-dangle */

const routesNonConnecteWebhooks = ({
  adaptateurEnvironnement,
  middleware,
  depotDonnees,
}: {
  adaptateurEnvironnement: AdaptateurEnvironnement;
  middleware: Middleware;
  depotDonnees: DepotDonnees;
}) => {
  const routes = express.Router();

  routes.post(
    '/updateConsentementPixelDeSuivi',
    middleware.verificationAddresseIP(
      adaptateurEnvironnement.sendinblue().adressesIpAppelantNosWebhooks()
    ),
    async (requete, reponse) => {
      // On valide ici et pas dans `valideBody` car on ne veut pas renvoyer 400 (et polluer nos logs)
      // sur tous les appels qui ne sont pas explicitement du pixel de suivi.
      const concerneLePixelDeSuivi =
        schemaPostConsentementPixelDeSuivi.safeParse(requete.body);

      if (!concerneLePixelDeSuivi.success) {
        reponse.sendStatus(204);
        return;
      }

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
