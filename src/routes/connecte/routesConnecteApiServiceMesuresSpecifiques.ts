import express from 'express';
import { z } from 'zod';
import { valideBody, valideParams } from '../../http/validePayloads.js';
import {
  schemaPostMesureSpecifique,
  schemaPutMesureSpecifique,
} from './routesConnecteApiService.schema.js';
import MesureSpecifique from '../../modeles/mesureSpecifique.js';
import {
  ErreurMesureInconnue,
  ErreurSuppressionImpossible,
} from '../../erreurs.js';
import { Middleware } from '../../http/middleware.interface.js';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { UUID } from '../../typesBasiques.js';

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

export const routesConnecteApiServiceMesuresSpecifiques = ({
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

  routes.post(
    '/:id/mesuresSpecifiques',
    middleware.verificationAcceptationCGU,
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    valideBody(
      z.strictObject(schemaPostMesureSpecifique(referentiel, referentielV2))
    ),
    async (requete, reponse) => {
      const {
        idUtilisateurCourant: idUtilisateur,
        service,
        body,
      } = requete as unknown as RequestRouteConnecteService;

      const {
        description,
        descriptionLongue,
        categorie,
        statut,
        modalites,
        priorite,
        echeance,
        responsables,
      } = body;

      await depotDonnees.ajouteMesureSpecifiqueAuService(
        new MesureSpecifique(
          {
            description,
            descriptionLongue,
            categorie,
            statut,
            modalites,
            priorite,
            echeance,
            responsables,
          },
          referentiel
        ),
        idUtilisateur,
        service.id
      );
      reponse.sendStatus(201);
    }
  );

  routes.put(
    '/:id/mesuresSpecifiques/:idMesure',
    middleware.verificationAcceptationCGU,
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    valideParams(z.looseObject({ idMesure: z.uuid() })),
    valideBody(
      z.strictObject(schemaPutMesureSpecifique(referentiel, referentielV2))
    ),
    async (requete, reponse, suite) => {
      const { service, idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecteService;

      const { idMesure } = requete.params;
      const {
        description,
        descriptionLongue,
        idModele,
        categorie,
        statut,
        modalites,
        priorite,
        echeance,
        responsables,
      } = requete.body;

      try {
        const mesureSpecifique = new MesureSpecifique(
          {
            id: idMesure as UUID,
            description,
            descriptionLongue,
            idModele,
            categorie,
            statut,
            modalites,
            priorite,
            echeance,
            responsables,
          },
          referentiel
        );
        await depotDonnees.metsAJourMesureSpecifiqueDuService(
          service.id,
          idUtilisateurCourant,
          mesureSpecifique
        );

        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurMesureInconnue)
          reponse.status(404).send('La mesure est introuvable');
        else suite(e);
      }
    }
  );

  routes.delete(
    '/:id/mesuresSpecifiques/:idMesure',
    middleware.verificationAcceptationCGU,
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    async (requete, reponse) => {
      const { service, idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecteService;
      const { idMesure } = requete.params;

      try {
        await depotDonnees.supprimeMesureSpecifiqueDuService(
          service.id,
          idUtilisateurCourant,
          idMesure
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurSuppressionImpossible) {
          reponse.sendStatus(400);
          return;
        }

        throw e;
      }
    }
  );

  return routes;
};
