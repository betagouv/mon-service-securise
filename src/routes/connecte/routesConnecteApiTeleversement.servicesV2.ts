import express from 'express';
import { ErreurFichierXlsInvalide } from '../../erreurs.js';
import BusEvenements from '../../bus/busEvenements.js';
import { LigneServiceTeleverseV2 } from '../../modeles/televersement/serviceTeleverseV2.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonneesTeleversementServices } from '../../depots/depotDonneesTeleversementServices.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { UUID } from '../../typesBasiques.js';
import Service from '../../modeles/service.js';
import { DepotPourTeleversementServices } from '../../modeles/televersement/televersementServicesV2.js';

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
  depotDonnees: DepotDonneesTeleversementServices &
    DepotPourTeleversementServices & {
      services: (idUtilisateur: UUID) => Promise<Service[]>;
    };
  middleware: Middleware;
};

const routesConnecteApiTeleversementServicesV2 = ({
  lecteurDeFormData,
  adaptateurTeleversementServices,
  depotDonnees,
  middleware,
  busEvenements,
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
        donneesTeleversement
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

  routes.get('/', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const televersementServices =
      await depotDonnees.lisTeleversementServices(idUtilisateurCourant);

    if (!televersementServices) return reponse.sendStatus(404);

    const rapportDetaille = await televersementServices.rapportDetaille(
      idUtilisateurCourant,
      depotDonnees
    );

    return reponse.json(rapportDetaille);
  });

  routes.post('/confirme', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const televersementServices =
      await depotDonnees.lisTeleversementServices(idUtilisateurCourant);

    if (!televersementServices) return reponse.sendStatus(404);

    const rapportDetaille = await televersementServices.rapportDetaille(
      idUtilisateurCourant,
      depotDonnees
    );

    if (rapportDetaille.statut === 'INVALIDE') return reponse.sendStatus(400);

    // En mode "fire & forget" pour ne pas ralentir la route.
    // La progression sera pollée via `GET /progression` par le front.
    televersementServices.creeLesServices(
      idUtilisateurCourant,
      depotDonnees,
      busEvenements
    );

    return reponse.sendStatus(201);
  });

  routes.get('/progression', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const progression =
      await depotDonnees.lisPourcentageProgressionTeleversementServices(
        idUtilisateurCourant
      );

    return progression === undefined
      ? reponse.sendStatus(404)
      : reponse.json({ progression });
  });

  routes.delete('/', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    await depotDonnees.supprimeTeleversementServices(idUtilisateurCourant);

    reponse.sendStatus(200);
  });

  return routes;
};

export { routesConnecteApiTeleversementServicesV2 };
