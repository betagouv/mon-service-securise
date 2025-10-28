import express from 'express';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import ActiviteMesure from '../../modeles/activiteMesure.js';

const { LECTURE, ECRITURE } = Permissions;
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
    async (requete, reponse) => {
      reponse.status(200);
      const activites = await depotDonnees.lisActivitesMesure(
        requete.service.id,
        requete.params.idMesure
      );

      const resultat = activites.map((a) => ({
        date: a.date.toISOString(),
        idActeur: a.idActeur,
        identifiantNumeriqueMesure:
          a.typeMesure === 'generale'
            ? referentiel.mesure(a.idMesure).identifiantNumerique
            : undefined,
        type: a.type,
        details: a.details,
      }));

      reponse.send(resultat);
    }
  );

  routes.post(
    '/:id/mesures/:idMesure/activites/commentaires',
    middleware.aseptise('contenu'),
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    async (requete, reponse) => {
      const { idMesure } = requete.params;
      const { service, idUtilisateurCourant } = requete;

      const estUneMesureGenerale =
        referentiel.estIdentifiantMesureConnu(idMesure);
      const estUneMesureSpecifique = service
        .mesuresSpecifiques()
        .avecId(idMesure);

      if (!estUneMesureGenerale && !estUneMesureSpecifique) {
        reponse.sendStatus(404);
        return;
      }

      await depotDonnees.ajouteActiviteMesure(
        new ActiviteMesure({
          idService: service.id,
          idActeur: idUtilisateurCourant,
          type: 'ajoutCommentaire',
          details: { contenu: requete.body.contenu },
          idMesure,
          typeMesure: estUneMesureGenerale ? 'generale' : 'specifique',
        })
      );
      reponse.sendStatus(200);
    }
  );
  return routes;
};

export default routesConnecteApiServiceActivitesMesure;
