import express from 'express';
import z from 'zod';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import EvenementRetourUtilisateurMesure from '../../modeles/journalMSS/evenementRetourUtilisateurMesure.js';
import { Middleware } from '../../http/middleware.interface.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';
import { valideBody } from '../../http/validePayloads.js';
import { schemaMesureGenerale } from '../../http/schemas/mesure.schema.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

export const routesConnecteApiServiceRetourUtilisateur = ({
  adaptateurJournal,
  middleware,
  referentiel,
  referentielV2,
}: {
  adaptateurJournal: AdaptateurJournalMSS;
  middleware: Middleware;
  referentiel: Referentiel;
  referentielV2: ReferentielV2;
}) => {
  const routes = express.Router();

  routes.post(
    '/:id/retourUtilisateurMesure',
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    valideBody(
      z.strictObject({
        idMesure: schemaMesureGenerale.id(referentiel, referentielV2),
        idRetour: z.enum(Object.keys(referentielV2.retoursUtilisateurMesure())),
        commentaire: z.string().max(1000).optional(),
      })
    ),
    async (requete, reponse) => {
      const { service, idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecteService;
      const { idRetour, idMesure, commentaire } = requete.body;

      await adaptateurJournal.consigneEvenement(
        new EvenementRetourUtilisateurMesure({
          idService: service.id,
          idUtilisateur: idUtilisateurCourant,
          idMesure,
          idRetour,
          commentaire,
        }).toJSON()
      );

      reponse.sendStatus(200);
    }
  );

  return routes;
};
