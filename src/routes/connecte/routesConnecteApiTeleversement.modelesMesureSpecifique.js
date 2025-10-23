import express from 'express';
import {
  ErreurFichierXlsInvalide,
  ErreurTeleversementInexistant,
  ErreurTeleversementInvalide,
} from '../../erreurs.js';

const routesConnecteApiTeleversementModelesMesureSpecifique = ({
  middleware,
  lecteurDeFormData,
  adaptateurTeleversementModelesMesureSpecifique,
  depotDonnees,
}) => {
  const routes = express.Router();
  routes.post('/', middleware.protegeTrafic(), async (requete, reponse) => {
    try {
      const buffer = await lecteurDeFormData.extraisDonneesXLS(requete);
      const donnees =
        await adaptateurTeleversementModelesMesureSpecifique.extraisDonneesTeleversees(
          buffer
        );
      await depotDonnees.nouveauTeleversementModelesMesureSpecifique(
        requete.idUtilisateurCourant,
        donnees
      );

      reponse.sendStatus(201);
    } catch (e) {
      if (e instanceof ErreurFichierXlsInvalide) {
        reponse.sendStatus(400);
        return;
      }

      throw e;
    }
  });

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
