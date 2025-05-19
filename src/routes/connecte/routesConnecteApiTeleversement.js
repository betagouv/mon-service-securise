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

  routes.get('/services', async (requete, reponse) => {
    const services = await depotDonnees.services(requete.idUtilisateurCourant);
    const nomsServicesExistants = services.map((service) =>
      service.nomService()
    );
    const televersementServices = await depotDonnees.lisTeleversementServices(
      requete.idUtilisateurCourant
    );

    if (!televersementServices) return reponse.sendStatus(404);

    const rapportDetaille = televersementServices.rapportDetaille(
      nomsServicesExistants
    );

    return reponse.json(rapportDetaille);
  });

  routes.delete('/services', async (requete, reponse) => {
    const aSupprime = await depotDonnees.supprimeTeleversementServices(
      requete.idUtilisateurCourant
    );
    reponse.sendStatus(aSupprime ? 200 : 404);
  });

  return routes;
};

module.exports = routesConnecteApiTeleversement;
