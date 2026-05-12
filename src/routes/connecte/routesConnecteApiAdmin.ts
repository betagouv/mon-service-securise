import express from 'express';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { ServiceAdministrationOrganisations } from '../../supervision/serviceAdministrationOrganisations.js';

type Configuration = {
  serviceAdministrationOrganisations: ServiceAdministrationOrganisations;
};

const routesConnecteApiAdmin = ({
  serviceAdministrationOrganisations,
}: Configuration) => {
  const routes = express.Router();

  routes.get('/entites', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const entites =
      await serviceAdministrationOrganisations.entitesDe(idUtilisateurCourant);

    reponse.json(entites.map((entite) => entite.toJSON()));
  });

  routes.get('/utilisateurs', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const utilisateurs =
      await serviceAdministrationOrganisations.utilisateursDansLePerimetreDe(
        idUtilisateurCourant
      );

    reponse.json(
      utilisateurs.map((u) => ({
        id: u.id,
        prenomNom: u.prenomNom(),
        email: u.email,
        entite: u.entite.toJSON(),
        postes: u.postes,
      }))
    );
  });

  return routes;
};

export { routesConnecteApiAdmin };
