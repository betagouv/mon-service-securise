import express from 'express';
import { z } from 'zod';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { reglesValidationDonneesServiceSansNiveauSecurite } from './routesConnecte.schema.js';
import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../modeles/descriptionServiceV2.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
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
    valideBody(
      z.strictObject(reglesValidationDonneesServiceSansNiveauSecurite)
    ),
    async (requete, reponse) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const donneesDescription: DonneesDescriptionServiceV2 = {
        ...requete.body,
        organisationResponsable: { siret: requete.body.siret },
        pointsAcces: requete.body.pointsAcces.map((p) => ({ description: p })),
      } as DonneesDescriptionServiceV2;

      await depotDonnees.ajouteDescriptionService(
        idUtilisateurCourant,
        requete.params.id,
        new DescriptionServiceV2(donneesDescription)
      );
      reponse.sendStatus(200);
    }
  );

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
