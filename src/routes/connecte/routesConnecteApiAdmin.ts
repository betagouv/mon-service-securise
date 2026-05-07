import express from 'express';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { DepotDonneesAdministrationOrganisations } from '../../depots/depotDonneesAdministrationOrganisations.interface.js';

type Configuration = {
  depotDonnees: DepotDonneesAdministrationOrganisations;
};

const routesConnecteApiAdmin = ({ depotDonnees }: Configuration) => {
  const routes = express.Router();

  routes.get('/entites', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const entites =
      await depotDonnees.entitesAdministreesPar(idUtilisateurCourant);

    reponse.json(entites.map((entite) => entite.toJSON()));
  });

  return routes;
};

export { routesConnecteApiAdmin };
