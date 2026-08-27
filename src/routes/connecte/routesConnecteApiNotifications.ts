import express from 'express';
import CentreNotifications from '../../notifications/centreNotifications.js';
import {
  ErreurIdentifiantNouveauteInconnu,
  ErreurIdentifiantTacheInconnu,
} from '../../erreurs.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';

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

  routes.put('/nouveautes/:id', async (requete, reponse, suite) => {
    const { idUtilisateurCourant } = requete as unknown as RequestRouteConnecte;
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
  });

  routes.put('/taches/:id', async (requete, reponse, suite) => {
    const { idUtilisateurCourant } = requete as unknown as RequestRouteConnecte;
    const centreNotifications = new CentreNotifications({
      depotDonnees,
      referentiel,
      adaptateurHorloge,
    });
    try {
      await centreNotifications.marqueTacheDeServiceLue(
        idUtilisateurCourant,
        requete.params.id
      );
      reponse.sendStatus(200);
    } catch (e) {
      if (e instanceof ErreurIdentifiantTacheInconnu) {
        reponse.status(400).send('Identifiant de tâche inconnu');
        return;
      }
      suite(e);
    }
  });

  return routes;
};

export default routesConnecteApiNotifications;
