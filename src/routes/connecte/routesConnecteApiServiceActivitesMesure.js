import express from 'express';
import { z } from 'zod';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import ActiviteMesure from '../../modeles/activiteMesure.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { reglesValidationIdMesure } from './routesConnecteApiServiceActivitesMesure.schema.js';

const { LECTURE, ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

const routesConnecteApiServiceActivitesMesure = ({
  middleware,
  depotDonnees,
  referentiel,
  referentielV2,
}) => {
  const routes = express.Router();

  routes.get(
    '/:id/mesures/:idMesure/activites',
    valideParams(
      z.strictObject(reglesValidationIdMesure(referentiel, referentielV2))
    ),
    middleware.trouveService({ [SECURISER]: LECTURE }),
    async (requete, reponse) => {
      const { service } = requete;
      const activites = await depotDonnees.lisActivitesMesure(
        service.id,
        requete.params.idMesure
      );

      const resultat = activites.map((a) => ({
        date: a.date.toISOString(),
        idActeur: a.idActeur,
        identifiantNumeriqueMesure:
          a.typeMesure === 'generale'
            ? service.referentiel.mesure(a.idMesure).identifiantNumerique
            : undefined,
        type: a.type,
        details: a.details,
      }));

      reponse.send(resultat);
    }
  );

  routes.post(
    '/:id/mesures/:idMesure/activites/commentaires',
    valideParams(
      z.strictObject(reglesValidationIdMesure(referentiel, referentielV2))
    ),
    valideBody(z.strictObject({ contenu: z.string().min(1).max(1000) })),
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    async (requete, reponse) => {
      const { idMesure } = requete.params;
      const { service, idUtilisateurCourant } = requete;

      const estUneMesureGenerale =
        service.referentiel.estIdentifiantMesureConnu(idMesure);
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
