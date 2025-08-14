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

    const nbPourUtilisateur =
      await depotDonnees.nbModelesMesureSpecifiquePourUtilisateur(
        requete.idUtilisateurCourant
      );

    return reponse.json(
      televersement.rapportDetaille({
        nbActuelModelesMesureSpecifique: nbPourUtilisateur,
      })
    );
  });

  routes.delete('/', async (requete, reponse) => {
    await depotDonnees.supprimeTeleversementModelesMesureSpecifique(
      requete.idUtilisateurCourant
    );
    reponse.sendStatus(200);
  });

  routes.post('/confirme', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete;

    const televersement =
      await depotDonnees.lisTeleversementModelesMesureSpecifique(
        idUtilisateurCourant
      );
    if (!televersement) {
      reponse.sendStatus(404);
      return;
    }

    if (televersement.rapportDetaille().statut === 'INVALIDE') {
      reponse.sendStatus(400);
      return;
    }

    await depotDonnees.ajouteModelesMesureSpecifique(
      idUtilisateurCourant,
      televersement.donneesModelesMesureSpecifique()
    );
    await depotDonnees.supprimeTeleversementModelesMesureSpecifique(
      idUtilisateurCourant
    );

    reponse.sendStatus(201);
  });

  return routes;
};

module.exports = routesConnecteApiTeleversementModelesMesureSpecifique;
