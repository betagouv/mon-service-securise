import { z } from 'zod';
import express from 'express';
import {
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
} from '../../erreurs.js';
import { Middleware } from '../../http/middleware.interface.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { valideBody } from '../../http/validePayloads.js';

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

export const routesConnecteApiServiceModeleMesureSpecifique = ({
  depotDonnees,
  middleware,
}: {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
}) => {
  const routes = express.Router();

  routes.put(
    '/:id/modeles/mesureSpecifique',
    middleware.verificationAcceptationCGU,
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    valideBody(z.strictObject({ idsModeles: z.array(z.uuid()).min(1) })),
    async (requete, reponse) => {
      try {
        const { service, idUtilisateurCourant } =
          requete as unknown as RequestRouteConnecteService;

        await depotDonnees.associeModelesMesureSpecifiqueAuService(
          requete.body.idsModeles,
          service.id,
          idUtilisateurCourant
        );

        reponse.sendStatus(200);
      } catch (e) {
        if (
          e instanceof ErreurModeleDeMesureSpecifiqueIntrouvable ||
          e instanceof ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique
        ) {
          reponse.sendStatus(403);
          return;
        }
        if (e instanceof ErreurModeleDeMesureSpecifiqueDejaAssociee) {
          reponse.sendStatus(400);
          return;
        }
        throw e;
      }
    }
  );

  return routes;
};
