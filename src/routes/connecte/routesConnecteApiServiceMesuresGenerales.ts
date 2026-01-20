import express from 'express';
import * as objetGetMesures from '../../modeles/objetsApi/objetGetMesures.js';
import MesureGenerale from '../../modeles/mesureGenerale.js';
import {
  ErreurEcheanceMesureInvalide,
  ErreurMesureInconnue,
  ErreurPrioriteMesureInvalide,
  ErreurStatutMesureInvalide,
} from '../../erreurs.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { Middleware } from '../../http/middleware.interface.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';

const { ECRITURE, LECTURE } = Permissions;
const { SECURISER } = Rubriques;

export const routesConnecteApiServiceMesuresGenerales = ({
  depotDonnees,
  middleware,
}: {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
}) => {
  const routes = express.Router();

  routes.get(
    '/:id/mesures',
    middleware.trouveService({ [SECURISER]: LECTURE }),
    (requete, reponse) => {
      const { service } = requete as unknown as RequestRouteConnecteService;

      reponse.json(objetGetMesures.donnees(service));
    }
  );

  routes.put(
    '/:id/mesures/:idMesure',
    middleware.verificationAcceptationCGU,
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    middleware.aseptise(
      'statut',
      'modalites',
      'priorite',
      'echeance',
      'responsables.*'
    ),
    async (requete, reponse, suite) => {
      const { service, idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecteService;
      const { body, params } = requete;

      if (!body.statut) {
        reponse.status(400).send('Le statut de la mesure est obligatoire.');
        return;
      }

      if (body.echeance) {
        body.echeance = body.echeance.replaceAll('&#x2F;', '/');
      }
      const mesureGenerale = { ...body, id: params.idMesure };

      try {
        const mesure = new MesureGenerale(mesureGenerale, service.referentiel);
        await depotDonnees.metsAJourMesureGeneraleDuService(
          service.id,
          idUtilisateurCourant,
          mesure
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (
          e instanceof ErreurMesureInconnue ||
          e instanceof ErreurStatutMesureInvalide ||
          e instanceof ErreurPrioriteMesureInvalide ||
          e instanceof ErreurEcheanceMesureInvalide
        ) {
          reponse.status(400).send('La mesure est invalide.');
          return;
        }
        suite(e);
      }
    }
  );

  return routes;
};
