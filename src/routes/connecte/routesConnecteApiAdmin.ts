import express from 'express';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { DepotDonneesAdminsOrganisations } from '../../depots/depotDonneesAdminsOrganisations.interface.js';

type Configuration = {
  depotDonnees: DepotDonneesAdminsOrganisations;
};

const routesConnecteApiAdmin = ({ depotDonnees }: Configuration) => {
  const routes = express.Router();

  routes.get('/entites', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const entites =
      await depotDonnees.entitesAdministreesPar(idUtilisateurCourant);

    reponse.json(entites.map((entite) => entite.toJSON()));
  });

  routes.get('/utilisateurs', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const utilisateurs =
      await depotDonnees.utilisateursAdministresPar(idUtilisateurCourant);

    reponse.json(utilisateurs.map((u) => u.toJSON()));
  });

  return routes;
};

export { routesConnecteApiAdmin };
