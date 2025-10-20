import express from 'express';
import { z } from 'zod';
import { valideBody } from '../../http/validePayloads.js';
import { reglesValidationDonneesServiceSansNiveauSecurite } from './routesConnecte.schema.js';
import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../modeles/descriptionServiceV2.js';

const routesConnecteApiServiceV2 = () => {
  const routes = express.Router();

  routes.post(
    '/niveauSecuriteRequis',
    valideBody(
      z.strictObject(reglesValidationDonneesServiceSansNiveauSecurite)
    ),
    async (requete, reponse) => {
      const donnees = requete.body;
      const donneesDescription: DonneesDescriptionServiceV2 = {
        ...donnees,
        organisationResponsable: { siret: donnees.siret },
        pointsAcces: donnees.pointsAcces.map((p) => ({ description: p })),
      } as DonneesDescriptionServiceV2;

      const niveauDeSecuriteMinimal =
        DescriptionServiceV2.niveauSecuriteMinimalRequis(donneesDescription);

      return reponse.status(200).json({ niveauDeSecuriteMinimal });
    }
  );

  return routes;
};

export default routesConnecteApiServiceV2;
