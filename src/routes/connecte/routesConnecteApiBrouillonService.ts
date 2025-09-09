import express from 'express';
import * as z from 'zod';
import { DepotDonneesBrouillonService } from '../../depots/depotDonneesBrouillonService.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { UUID } from '../../typesBasiques.js';
import { ErreurBrouillonInexistant } from '../../erreurs.js';

const routesConnecteApiBrouillonService = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonneesBrouillonService;
}) => {
  const routes = express.Router();

  routes.post(
    '/',
    valideBody(
      z.strictObject({
        nomService: z.string().trim().nonempty(),
      })
    ),
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const { nomService } = requete.body;

      const id = await depotDonnees.nouveauBrouillonService(
        idUtilisateurCourant,
        nomService
      );

      return reponse.json({ id });
    }
  );

  routes.put(
    '/:id/siret',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    valideBody(
      z.strictObject({
        siret: z.string().regex(/^\d{14}$/),
      })
    ),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { id } = requete.params;
      const { siret } = requete.body;

      try {
        const brouillon = await depotDonnees.lisBrouillonService(
          idUtilisateurCourant,
          id as UUID
        );

        brouillon.metsAJourSiret(siret);

        await depotDonnees.sauvegardeBrouillonService(
          idUtilisateurCourant,
          brouillon
        );
      } catch (e) {
        if (e instanceof ErreurBrouillonInexistant)
          return reponse.sendStatus(404);

        return suite(e);
      }

      return reponse.sendStatus(200);
    }
  );

  routes.post(
    '/:id/finalise',
    valideParams(z.strictObject({ id: z.uuidv4() })),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const { id } = requete.params;

      try {
        const idService = await depotDonnees.finaliseBrouillonService(
          idUtilisateurCourant,
          id as UUID
        );

        return reponse.json({ idService });
      } catch (e) {
        if (e instanceof ErreurBrouillonInexistant)
          return reponse.sendStatus(404);

        return suite(e);
      }
    }
  );

  return routes;
};

export default routesConnecteApiBrouillonService;
