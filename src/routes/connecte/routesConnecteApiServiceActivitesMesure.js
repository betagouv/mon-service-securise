const express = require('express');
const {
  Permissions,
  Rubriques,
} = require('../../modeles/autorisations/gestionDroits');

const { LECTURE } = Permissions;
const { SECURISER } = Rubriques;

const routesConnecteApiServiceActivitesMesure = ({
  middleware,
  depotDonnees,
  referentiel,
}) => {
  const routes = express.Router();
  routes.get(
    '/:id/mesures/:idMesure/activites',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    (requete, reponse) => {
      reponse.status(200);
      const activites = depotDonnees.litActivitesMesure(
        requete.service.id,
        requete.params.idMesure
      );

      const resultat = activites.map((a) => ({
        date: a.date.toISOString(),
        idActeur: a.idActeur,
        identifiantNumeriqueMesure:
          referentiel.mesures()[a.idMesure].identifiantNumerique,
        type: a.type,
        details: a.details,
      }));

      reponse.send(resultat);
    }
  );
  return routes;
};

module.exports = routesConnecteApiServiceActivitesMesure;
