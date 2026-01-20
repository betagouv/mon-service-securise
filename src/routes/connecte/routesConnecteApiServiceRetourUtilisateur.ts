import express from 'express';
import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';
import EvenementRetourUtilisateurMesure from '../../modeles/journalMSS/evenementRetourUtilisateurMesure.js';
import { Middleware } from '../../http/middleware.interface.js';
import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import { RequestRouteConnecteService } from './routesConnecte.types.js';

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

export const routesConnecteApiServiceRetourUtilisateur = ({
  middleware,
  adaptateurJournal,
}: {
  middleware: Middleware;
  adaptateurJournal: AdaptateurJournalMSS;
}) => {
  const routes = express.Router();

  routes.post(
    '/:id/retourUtilisateurMesure',
    middleware.trouveService({ [SECURISER]: ECRITURE }),
    middleware.aseptise('id', 'idMesure', 'idRetour', 'commentaire'),
    async (requete, reponse) => {
      const { service, idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecteService;
      const { idRetour, idMesure, commentaire } = requete.body;
      const retourUtilisateur =
        service.referentiel.retourUtilisateurMesureAvecId(idRetour);

      if (!retourUtilisateur) {
        reponse.status(424).send({
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de retour utilisateur est incorrect.",
        });
        return;
      }

      if (!service.referentiel.estIdentifiantMesureConnu(idMesure)) {
        reponse.status(424).send({
          type: 'DONNEES_INCORRECTES',
          message: "L'identifiant de mesure est incorrect.",
        });
        return;
      }

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
