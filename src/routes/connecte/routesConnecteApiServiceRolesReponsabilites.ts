import express from 'express';
import ActeursHomologation from '../../modeles/acteursHomologation.js';
import PartiesPrenantes from '../../modeles/partiesPrenantes/partiesPrenantes.js';
import RolesResponsabilites from '../../modeles/rolesResponsabilites.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';

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
    middleware.aseptiseListes([
      {
        nom: 'acteursHomologation',
        proprietes: ActeursHomologation.proprietesItem(),
      },
      {
        nom: 'partiesPrenantes',
        proprietes: PartiesPrenantes.proprietesItem(),
      },
    ]),
    async (requete, reponse) => {
      const rolesResponsabilites = new RolesResponsabilites(requete.body);

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
