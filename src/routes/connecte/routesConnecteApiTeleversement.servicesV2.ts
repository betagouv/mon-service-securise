import express from 'express';
import { ErreurFichierXlsInvalide } from '../../erreurs.js';
import BusEvenements from '../../bus/busEvenements.js';
import { LigneServiceTeleverseV2 } from '../../modeles/televersement/serviceTeleverseV2.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonneesTeleversementServices } from '../../depots/depotDonneesTeleversementServices.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { VersionService } from '../../modeles/versionService.js';

type ConfigurationRoutes = {
  lecteurDeFormData: {
    extraisDonneesXLS: (requete: express.Request) => Promise<Buffer>;
  };
  adaptateurTeleversementServices: {
    extraisTeleversementServicesV2: (
      buffer: Buffer
    ) => Promise<LigneServiceTeleverseV2[]>;
  };
  busEvenements: BusEvenements;
  depotDonnees: DepotDonneesTeleversementServices;
  middleware: Middleware;
};

const routesConnecteApiTeleversementServicesV2 = ({
  lecteurDeFormData,
  adaptateurTeleversementServices,
  depotDonnees,
  middleware,
}: ConfigurationRoutes) => {
  const routes = express.Router();

  routes.post('/', middleware.protegeTrafic(), async (requete, reponse) => {
    try {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const buffer = await lecteurDeFormData.extraisDonneesXLS(requete);
      const donneesTeleversement =
        await adaptateurTeleversementServices.extraisTeleversementServicesV2(
          buffer
        );
      await depotDonnees.nouveauTeleversementServices(
        idUtilisateurCourant,
        donneesTeleversement,
        VersionService.v2
      );
    } catch (e) {
      if (e instanceof ErreurFichierXlsInvalide) {
        reponse.sendStatus(400);
        return;
      }
      throw e;
    }
    reponse.sendStatus(201);
  });

  return routes;
};

export { routesConnecteApiTeleversementServicesV2 };
