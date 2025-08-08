const express = require('express');
const { ErreurFichierXlsInvalide } = require('../../erreurs');

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

  return routes;
};

module.exports = routesConnecteApiTeleversementModelesMesureSpecifique;
