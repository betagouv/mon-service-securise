const express = require('express');
const { ErreurFichierXlsInvalide } = require('../../erreurs');

const routesConnecteApiTeleversement = ({
  adaptateurControleFichier,
  adaptateurXLS,
  depotDonnees,
  middleware,
}) => {
  const routes = express.Router();
  routes.post(
    '/services',
    middleware.protegeTrafic(),
    async (requete, reponse) => {
      try {
        const buffer =
          await adaptateurControleFichier.extraisDonneesXLS(requete);
        const donneesTeleversement =
          await adaptateurXLS.extraisTeleversementServices(buffer);
        await depotDonnees.nouveauTeleversementServices(
          requete.idUtilisateurCourant,
          donneesTeleversement
        );
      } catch (e) {
        if (e instanceof ErreurFichierXlsInvalide) {
          reponse.sendStatus(400);
          return;
        }
        throw e;
      }
      reponse.sendStatus(201);
    }
  );
  return routes;
};

module.exports = routesConnecteApiTeleversement;
