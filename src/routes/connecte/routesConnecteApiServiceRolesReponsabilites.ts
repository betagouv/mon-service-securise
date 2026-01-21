import express from 'express';
import { z } from 'zod';
import RolesResponsabilites from '../../modeles/rolesResponsabilites.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { valideBody } from '../../http/validePayloads.js';
import { schemaPostRolesResponsabilites } from './routesConnecteApiServiceRolesReponsabilites.schema.js';

const { ECRITURE } = Permissions;
const { CONTACTS } = Rubriques;

export const routesConnecteApiServiceRolesReponsaibilites = ({
  depotDonnees,
  middleware,
}: {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
}) => {
  const routes = express.Router();

  routes.post(
    '/:id/rolesResponsabilites',
    middleware.trouveService({ [CONTACTS]: ECRITURE }),
    valideBody(z.strictObject(schemaPostRolesResponsabilites())),
    async (requete, reponse) => {
      const {
        acteursHomologation,
        autoriteHomologation,
        fonctionAutoriteHomologation,
        fonctionDelegueProtectionDonnees,
        delegueProtectionDonnees,
        fonctionExpertCybersecurite,
        expertCybersecurite,
        fonctionPiloteProjet,
        piloteProjet,
        partiesPrenantes,
      } = requete.body;

      const rolesResponsabilites = new RolesResponsabilites({
        acteursHomologation,
        autoriteHomologation,
        fonctionAutoriteHomologation,
        fonctionDelegueProtectionDonnees,
        delegueProtectionDonnees,
        fonctionExpertCybersecurite,
        expertCybersecurite,
        fonctionPiloteProjet,
        piloteProjet,
        partiesPrenantes,
      });

      const {
        service: { id: idService },
      } = requete as unknown as RequestRouteConnecteService;

      await depotDonnees.ajouteRolesResponsabilitesAService(
        idService,
        rolesResponsabilites
      );

      reponse.send({ idService });
    }
  );

  return routes;
};
