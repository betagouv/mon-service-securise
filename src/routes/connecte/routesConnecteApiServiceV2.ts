import express from 'express';
import { z } from 'zod';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { reglesValidationDescriptionServiceV2 } from './routesConnecte.schema.js';
import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../modeles/descriptionServiceV2.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';

const { ECRITURE } = Permissions;
const { DECRIRE } = Rubriques;

const routesConnecteApiServiceV2 = ({
  middleware,
  depotDonnees,
}: {
  middleware: Middleware;
  depotDonnees: DepotDonnees;
}) => {
  const routes = express.Router();

  routes.put(
    '/:id',
    middleware.trouveService({ [DECRIRE]: ECRITURE }),
    valideParams(z.strictObject({ id: z.uuidv4() })),
    valideBody(z.strictObject(reglesValidationDescriptionServiceV2)),
    async (requete, reponse) => {
      const { idUtilisateurCourant, service } =
        requete as unknown as RequestRouteConnecteService;
      await depotDonnees.ajouteDescriptionService(
        idUtilisateurCourant,
        requete.params.id,
        new DescriptionServiceV2(
          requete.body as DonneesDescriptionServiceV2,
          service.referentiel
        )
      );
      reponse.sendStatus(200);
    }
  );

  routes.post(
    '/niveauSecuriteRequis',
    valideBody(z.strictObject(reglesValidationDescriptionServiceV2)),
    async (requete, reponse) => {
      const niveauDeSecuriteMinimal =
        DescriptionServiceV2.niveauSecuriteMinimalRequis(
          requete.body as DonneesDescriptionServiceV2
        );

      return reponse.status(200).json({ niveauDeSecuriteMinimal });
    }
  );

  return routes;
};

export default routesConnecteApiServiceV2;
