import ActiviteMesure from '../../modeles/activiteMesure.js';
import { DepotDonneesNotificationsTransactionnelles } from '../../depots/depotDonneesNotificationsTransactionnelles.js';
import { NotificationTransactionnelle } from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

export const sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure =

    ({
      depotDonnees,
    }: {
      depotDonnees: DepotDonneesNotificationsTransactionnelles;
    }) =>
    async ({ activiteMesure }: { activiteMesure: ActiviteMesure }) => {
      await depotDonnees.sauvegardeNotificationTransactionnelle(
        new NotificationTransactionnelle({
          idActeur: activiteMesure.idActeur,
        })
      );
    };
