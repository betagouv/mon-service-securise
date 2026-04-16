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
        autoriteHomologation,
        expertCybersecurite,
        delegueProtectionDonnees,
        piloteProjet,
        acteursHomologation,
        partiesPrenantes,
        partiesPrenantesSpecifiques,
      } = requete.body;

      const partiesPrenantesCompletes = Object.entries(partiesPrenantes).map(
        ([type, partiePrenante]) => ({
          type,
          ...(partiePrenante as Record<string, unknown>),
        })
      );
      partiesPrenantesCompletes.push(
        ...partiesPrenantesSpecifiques.map((p: Record<string, unknown>) => ({
          type: 'PartiePrenanteSpecifique',
          ...p,
        }))
      );
      const rolesResponsabilites = new RolesResponsabilites({
        acteursHomologation,
        autoriteHomologation: autoriteHomologation.nom,
        fonctionAutoriteHomologation: autoriteHomologation.fonction,
        delegueProtectionDonnees: delegueProtectionDonnees.nom,
        fonctionDelegueProtectionDonnees: delegueProtectionDonnees.fonction,
        expertCybersecurite: expertCybersecurite.nom,
        fonctionExpertCybersecurite: expertCybersecurite.fonction,
        piloteProjet: piloteProjet.nom,
        fonctionPiloteProjet: piloteProjet.fonction,
        partiesPrenantes: partiesPrenantesCompletes,
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
