import express from 'express';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { DepotDonneesParcoursUtilisateur } from '../../depots/depotDonneesParcoursUtilisateur.interface.js';

export const routesConnecteApiExplicationNouveauReferentiel = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonneesParcoursUtilisateur;
}) => {
  const routes = express.Router();

  routes.post('/termine', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.finaliseExplicationNouveauReferentiel();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  return routes;
};
