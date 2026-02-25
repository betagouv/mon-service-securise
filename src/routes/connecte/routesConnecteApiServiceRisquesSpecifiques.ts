import express, { Request } from 'express';
import { z } from 'zod';
import RisqueSpecifique from '../../modeles/risqueSpecifique.js';
import { ErreurRisqueInconnu } from '../../erreurs.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Middleware } from '../../http/middleware.interface.js';
import { ReferentielV2 } from '../../referentiel.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import Service from '../../modeles/service.js';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import {
  schemaPostRisqueSpecifique,
  schemaPutRisqueSpecifique,
} from './routesConnecteApiServiceRisquesSpecifiques.schema.js';
import { UUID } from '../../typesBasiques.js';

const { ECRITURE } = Permissions;
const { RISQUES } = Rubriques;

type RequeteAvecService = Request & {
  service: Service;
};

export const routesConnecteApiServiceRisquesSpecifiques = ({
  depotDonnees,
  middleware,
  referentielV2,
}: {
  depotDonnees: DepotDonnees;
  middleware: Middleware;
  referentielV2: ReferentielV2;
}) => {
  const routes = express.Router();

  routes.post(
    '/:id/risquesSpecifiques',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    valideBody(z.strictObject(schemaPostRisqueSpecifique(referentielV2))),
    async (requete, reponse) => {
      const { service } = requete as unknown as RequeteAvecService;
      const {
        niveauGravite,
        niveauVraisemblance,
        intitule,
        commentaire,
        description,
        categories,
      } = requete.body;

      RisqueSpecifique.valide(
        {
          niveauVraisemblance,
          niveauGravite,
          intitule,
          commentaire,
          description,
          categories,
        },
        referentielV2
      );
      const risque = new RisqueSpecifique(
        {
          niveauGravite,
          niveauVraisemblance,
          intitule,
          commentaire,
          description,
          categories,
        },
        referentielV2
      );

      await depotDonnees.ajouteRisqueSpecifiqueAService(service.id, risque);

      reponse.status(201).send(risque.toJSON());
    }
  );

  routes.put(
    '/:id/risquesSpecifiques/:idRisque',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    valideParams(z.looseObject({ idRisque: z.uuid() })),
    valideBody(z.strictObject(schemaPutRisqueSpecifique(referentielV2))),
    async (requete, reponse, suite) => {
      const {
        niveauGravite,
        niveauVraisemblance,
        intitule,
        commentaire,
        description,
        categories,
      } = requete.body;
      const { idRisque } = requete.params;
      const { service } = requete as unknown as RequeteAvecService;
      try {
        RisqueSpecifique.valide(
          {
            niveauGravite,
            niveauVraisemblance,
            intitule,
            commentaire,
            description,
            categories,
          },
          referentielV2
        );
        const risque = new RisqueSpecifique(
          {
            id: idRisque as UUID,
            niveauGravite,
            niveauVraisemblance,
            intitule,
            commentaire,
            description,
            categories,
          },
          referentielV2
        );
        await depotDonnees.metsAJourRisqueSpecifiqueDuService(
          service.id,
          risque
        );
        reponse.status(200).send(risque.toJSON());
      } catch (e) {
        if (e instanceof ErreurRisqueInconnu) {
          reponse.status(404).send('Le risque est introuvable');
          return;
        }
        suite(e);
      }
    }
  );

  routes.delete(
    '/:id/risquesSpecifiques/:idRisque',
    middleware.trouveService({ [RISQUES]: ECRITURE }),
    valideParams(z.looseObject({ idRisque: z.uuid() })),
    async (requete, reponse) => {
      const { idRisque } = requete.params;
      const { service } = requete as unknown as RequeteAvecService;

      await depotDonnees.supprimeRisqueSpecifiqueDuService(
        service.id,
        idRisque
      );

      reponse.sendStatus(200);
    }
  );

  return routes;
};
