import { z } from 'zod';
import express from 'express';
import * as objetGetMesures from '../../modeles/objetsApi/objetGetMesures.js';
import MesureGenerale from '../../modeles/mesureGenerale.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { Middleware } from '../../http/middleware.interface.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { schemaPutMesureGenerale } from './routesConnecteApiServiceMesuresGenerales.schema.js';
import { schemaMesureGenerale } from '../../http/schemas/mesure.schema.js';

const { ECRITURE, LECTURE } = Permissions;
const { SECURISER } = Rubriques;

export const routesConnecteApiServiceMesuresGenerales = ({
  depotDonnees,
  middleware,
  referentiel,
  referentielV2,
}: {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  referentiel: Referentiel;
  referentielV2: ReferentielV2;
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
    valideParams(
      z.looseObject({
        idMesure: schemaMesureGenerale.id(referentiel, referentielV2),
      })
    ),
    valideBody(
      z.strictObject(schemaPutMesureGenerale(referentiel, referentielV2))
    ),
    async (requete, reponse) => {
      const { service, idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecteService;

      const { idMesure } = requete.params;
      const { statut, modalites, echeance, responsables, priorite } =
        requete.body;

      const mesureGenerale = {
        id: idMesure,
        statut,
        modalites,
        echeance,
        responsables,
        priorite,
      };

      const mesure = new MesureGenerale(mesureGenerale, service.referentiel);
      await depotDonnees.metsAJourMesureGeneraleDuService(
        service.id,
        idUtilisateurCourant,
        mesure
      );
      reponse.sendStatus(200);
    }
  );

  return routes;
};
