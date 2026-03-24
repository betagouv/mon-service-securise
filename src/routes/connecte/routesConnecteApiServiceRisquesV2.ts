import express from 'express';
import { z } from 'zod';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import {
  schemaPostRisqueSpecifiqueV2,
  schemaPutRisqueGeneralV2,
} from './routesConnecteApiService.schema.js';
import { Middleware } from '../../http/middleware.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { ReferentielV2 } from '../../referentiel.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { DonneesMiseAJourRisqueSpecifiqueV2 } from '../../moteurRisques/v2/risqueSpecifiqueV2.js';

const { ECRITURE, LECTURE } = Permissions;
const { RISQUES } = Rubriques;

const routesConnecteApiServiceRisquesV2 = ({
  middleware,
  depotDonnees,
  referentielV2,
}: {
  middleware: Middleware;
  depotDonnees: DepotDonnees;
  referentielV2: ReferentielV2;
}) => {
  const routes = express.Router();

  routes.get(
    '/:id/risques/v2',
    middleware.trouveService({ [RISQUES]: LECTURE }),
    middleware.chargeAutorisationsService,
    async (requete, reponse) => {
      const { service } = requete as unknown as RequestRouteConnecteService;

      reponse.json(service.risquesV2!.toJSON());
    }
  );

  routes.put(
    '/:id/risques/v2/:idRisque',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    middleware.chargeAutorisationsService,
    // @ts-expect-error problème de typage incompréhensible avec les requetes express et zod
    valideParams(
      z.looseObject({ idRisque: z.enum(referentielV2.identifiantsRisquesV2()) })
    ),
    valideBody(z.strictObject(schemaPutRisqueGeneralV2())),
    async (requete, reponse) => {
      const { service } = requete as unknown as RequestRouteConnecteService;
      const { idRisque } = requete.params;

      await depotDonnees.metsAJourRisqueV2(service.id, idRisque, requete.body);

      reponse.sendStatus(204);
    }
  );

  routes.post(
    '/:id/risques/v2/specifiques',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    middleware.chargeAutorisationsService,
    valideBody(z.strictObject(schemaPostRisqueSpecifiqueV2(referentielV2))),
    async (requete, reponse) => {
      const { service } = requete as unknown as RequestRouteConnecteService;

      const {
        intitule,
        description,
        categories,
        graviteBrute,
        vraisemblanceBrute,
        gravite,
        vraisemblance,
        commentaire,
      } = requete.body;

      const donnees: DonneesMiseAJourRisqueSpecifiqueV2 = {
        intitule,
        description,
        categories,
        risqueBrut: {
          gravite: graviteBrute,
          vraisemblance: vraisemblanceBrute,
        },
        gravite,
        vraisemblance,
        commentaire,
      };

      await depotDonnees.ajouteRisqueSpecifiqueV2(service.id, donnees);

      reponse.sendStatus(201);
    }
  );

  routes.put(
    '/:id/risques/v2/specifiques/:idRisque',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    middleware.chargeAutorisationsService,
    // @ts-expect-error problème de typage incompréhensible avec les requetes express et zod
    valideParams(z.looseObject({ idRisque: z.uuid() })),
    valideBody(z.strictObject(schemaPostRisqueSpecifiqueV2(referentielV2))),
    async (requete, reponse) => {
      const { service } = requete as unknown as RequestRouteConnecteService;

      const {
        intitule,
        description,
        categories,
        graviteBrute,
        vraisemblanceBrute,
        gravite,
        vraisemblance,
        commentaire,
      } = requete.body;

      const { idRisque } = requete.params;

      const donnees: DonneesMiseAJourRisqueSpecifiqueV2 = {
        intitule,
        description,
        categories,
        risqueBrut: {
          gravite: graviteBrute,
          vraisemblance: vraisemblanceBrute,
        },
        gravite,
        vraisemblance,
        commentaire,
      };

      await depotDonnees.metsAJourRisqueSpecifiqueV2(
        service.id,
        idRisque,
        donnees
      );

      reponse.sendStatus(200);
    }
  );

  return routes;
};

export default routesConnecteApiServiceRisquesV2;
