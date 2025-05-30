const express = require('express');
const { ErreurFichierXlsInvalide } = require('../../erreurs');

const routesConnecteApiTeleversement = ({
  adaptateurControleFichier,
  adaptateurXLS,
  busEvenements,
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
    await depotDonnees.supprimeTeleversementServices(
      requete.idUtilisateurCourant
    );
    reponse.sendStatus(200);
  });

  routes.post('/services/confirme', async (requete, reponse) => {
    const services = await depotDonnees.services(requete.idUtilisateurCourant);
    const nomsServicesExistants = services.map((service) =>
      service.nomService()
    );
    const televersementServices = await depotDonnees.lisTeleversementServices(
      requete.idUtilisateurCourant
    );

    if (!televersementServices) return reponse.sendStatus(404);
    const rapport = televersementServices.rapportDetaille(
      nomsServicesExistants
    );
    if (rapport.statut === 'INVALIDE') return reponse.sendStatus(400);

    televersementServices.creeLesServices(
      requete.idUtilisateurCourant,
      depotDonnees,
      busEvenements
    );

    return reponse.sendStatus(201);
  });

  routes.get('/services/progression', async (requete, reponse) => {
    const progression =
      await depotDonnees.lisPourcentageProgressionTeleversementServices(
        requete.idUtilisateurCourant
      );

    if (progression === undefined) return reponse.sendStatus(404);

    return reponse.json({ progression });
  });

  return routes;
};

module.exports = routesConnecteApiTeleversement;
