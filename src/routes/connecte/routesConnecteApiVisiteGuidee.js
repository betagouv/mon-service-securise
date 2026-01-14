import express from 'express';
import { z } from 'zod';
import { valideParams } from '../../http/validePayloads.js';
import { schemaVisiteGuidee } from '../../http/schemas/visiteGuidee.schema.js';

const routesConnecteApiVisiteGuidee = ({ depotDonnees, referentiel }) => {
  const routes = express.Router();

  routes.post(
    '/:idEtape/termine',
    valideParams(z.strictObject({ idEtape: schemaVisiteGuidee.idEtape() })),
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete;
      const { idEtape } = requete.params;

      const parcoursUtilisateur =
        await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);

      parcoursUtilisateur.etatVisiteGuidee.termineEtape(idEtape);
      await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

      const idEtapeSuivante = referentiel.etapeSuivanteVisiteGuidee(idEtape);
      const urlEtapeSuivante =
        referentiel.etapeVisiteGuidee(idEtapeSuivante)?.urlEtape ?? null;

      reponse.send({ urlEtapeSuivante });
    }
  );

  routes.post('/termine', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.finalise();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  routes.post('/metsEnPause', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.metsEnPause();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  routes.post('/reprends', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.reprends();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  routes.post('/reinitialise', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const parcoursUtilisateur =
      await depotDonnees.lisParcoursUtilisateur(idUtilisateurCourant);
    parcoursUtilisateur.etatVisiteGuidee.reinitialise();
    await depotDonnees.sauvegardeParcoursUtilisateur(parcoursUtilisateur);

    reponse.sendStatus(200);
  });

  return routes;
};

export default routesConnecteApiVisiteGuidee;
