import express from 'express';
import { z } from 'zod';
import {
  ErreurTeleversementInexistant,
  ErreurTeleversementInvalide,
} from '../../erreurs.js';
import { valideBody } from '../../http/validePayloads.js';
import { schemaPostTeleversementModelesMesureSpecifique } from './routesConnecteApiTeleversement.schema.js';

const routesConnecteApiTeleversementModelesMesureSpecifique = ({
  middleware,
  depotDonnees,
  referentiel,
}) => {
  const routes = express.Router();
  routes.post(
    '/',
    middleware.protegeTrafic(),
    valideBody(
      z.strictObject(
        schemaPostTeleversementModelesMesureSpecifique(referentiel)
      )
    ),
    async (requete, reponse) => {
      await depotDonnees.nouveauTeleversementModelesMesureSpecifique(
        requete.idUtilisateurCourant,
        requete.body.modelesMesureSpecifique
      );

      reponse.sendStatus(201);
    }
  );

  routes.get('/', async (requete, reponse) => {
    const televersement =
      await depotDonnees.lisTeleversementModelesMesureSpecifique(
        requete.idUtilisateurCourant
      );

    if (!televersement) return reponse.sendStatus(404);

    return reponse.json(televersement.rapportDetaille());
  });

  routes.delete('/', async (requete, reponse) => {
    await depotDonnees.supprimeTeleversementModelesMesureSpecifique(
      requete.idUtilisateurCourant
    );
    reponse.sendStatus(200);
  });

  routes.post('/confirme', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;
    try {
      await depotDonnees.confirmeTeleversementModelesMesureSpecifique(
        idUtilisateurCourant
      );
      reponse.sendStatus(201);
    } catch (e) {
      if (e instanceof ErreurTeleversementInexistant) {
        reponse.sendStatus(404);
        return;
      }
      if (e instanceof ErreurTeleversementInvalide) {
        reponse.sendStatus(400);
        return;
      }
      throw e;
    }
  });

  return routes;
};

export default routesConnecteApiTeleversementModelesMesureSpecifique;
