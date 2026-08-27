import { z } from 'zod';
import express from 'express';
import CentreNotifications from '../../notifications/centreNotifications.js';
import {
  ErreurIdentifiantNotificationTransactionnelleInconnu,
  ErreurIdentifiantNouveauteInconnu,
  ErreurIdentifiantTacheInconnu,
} from '../../erreurs.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import {
  schemaPutNotificationTransactionnelle,
  schemaPutNouveaute,
  schemaPutTache,
} from './routesConnecteApiNotifications.schema.js';
import { valideParams } from '../../http/validePayloads.js';
import { UUID } from '../../typesBasiques.js';

const routesConnecteApiNotifications = ({
  adaptateurHorloge,
  depotDonnees,
  referentiel,
}: {
  adaptateurHorloge: AdaptateurHorloge;
  depotDonnees: DepotDonnees;
  referentiel: TousReferentiels;
}) => {
  const routes = express.Router();

  routes.get('/', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;
    const centreNotifications = new CentreNotifications({
      depotDonnees,
      referentiel,
      adaptateurHorloge,
    });
    reponse.json({
      notifications:
        await centreNotifications.toutesNotifications(idUtilisateurCourant),
    });
  });

  routes.put(
    '/nouveautes/:id',
    valideParams(z.strictObject(schemaPutNouveaute(referentiel))),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const centreNotifications = new CentreNotifications({
        depotDonnees,
        referentiel,
        adaptateurHorloge,
      });
      try {
        await centreNotifications.marqueNouveauteLue(
          idUtilisateurCourant,
          requete.params.id
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurIdentifiantNouveauteInconnu) {
          reponse.status(400).send('Identifiant de nouveauté inconnu');
          return;
        }
        suite(e);
      }
    }
  );

  routes.put(
    '/taches/:id',
    valideParams(z.strictObject(schemaPutTache())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;
      const centreNotifications = new CentreNotifications({
        depotDonnees,
        referentiel,
        adaptateurHorloge,
      });
      try {
        await centreNotifications.marqueTacheDeServiceLue(
          idUtilisateurCourant,
          requete.params.id as UUID
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurIdentifiantTacheInconnu) {
          reponse.status(400).send('Identifiant de tâche inconnu');
          return;
        }
        suite(e);
      }
    }
  );

  routes.put(
    '/transactionnelles/:id',
    valideParams(z.strictObject(schemaPutNotificationTransactionnelle())),
    async (requete, reponse, suite) => {
      const { idUtilisateurCourant } =
        requete as unknown as RequestRouteConnecte;

      const centreNotifications = new CentreNotifications({
        depotDonnees,
        referentiel,
        adaptateurHorloge,
      });
      try {
        await centreNotifications.marqueNotificationTransactionnelleLue(
          requete.params.id as UUID,
          idUtilisateurCourant
        );
        reponse.sendStatus(200);
      } catch (e) {
        if (e instanceof ErreurIdentifiantNotificationTransactionnelleInconnu) {
          reponse.sendStatus(404);
          return;
        }
        suite(e);
      }
    }
  );

  return routes;
};

export default routesConnecteApiNotifications;
