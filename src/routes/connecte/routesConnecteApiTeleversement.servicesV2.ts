import express from 'express';
import { z } from 'zod';
import BusEvenements from '../../bus/busEvenements.js';
import { LigneServiceTeleverseV2 } from '../../modeles/televersement/serviceTeleverseV2.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonneesTeleversementServices } from '../../depots/depotDonneesTeleversementServices.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { UUID } from '../../typesBasiques.js';
import Service from '../../modeles/service.js';
import { DepotPourTeleversementServices } from '../../modeles/televersement/televersementServicesV2.js';
import { valideBody } from '../../http/validePayloads.js';
import { schemaPostTeleversementServices } from './routesConnecteApiTeleversement.schema.js';

type ConfigurationRoutes = {
  busEvenements: BusEvenements;
  depotDonnees: DepotDonneesTeleversementServices &
    DepotPourTeleversementServices & {
      services: (idUtilisateur: UUID) => Promise<Service[]>;
    };
  middleware: Middleware;
};

const routesConnecteApiTeleversementServicesV2 = ({
  depotDonnees,
  middleware,
  busEvenements,
}: ConfigurationRoutes) => {
  const routes = express.Router();

  routes.post(
    '/',
    middleware.protegeTrafic(),
    valideBody(z.strictObject(schemaPostTeleversementServices())),
    async (requete, reponse) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const services = requete.body.services as LigneServiceTeleverseV2[];

      await depotDonnees.nouveauTeleversementServices(
        idUtilisateurCourant,
        services
      );

      reponse.sendStatus(201);
    }
  );

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
