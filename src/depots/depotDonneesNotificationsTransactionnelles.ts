import { UUID } from '../typesBasiques.js';
import {
  DonneesNotificationTransactionnelle,
  NotificationTransactionnelle,
} from '../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

export type PersistanceNotificationTransactionnelle = {
  lisNotificationsDe(
    idDestinataire: UUID
  ): Promise<DonneesNotificationTransactionnelle[]>;
  sauvegardeNotificationTransactionnelle(
    donnees: DonneesNotificationTransactionnelle
  ): Promise<void>;
};

const creeDepot = (config: {
  adaptateurPersistance: PersistanceNotificationTransactionnelle;
}) => {
  const { adaptateurPersistance } = config;

  const lisNotifications = async (idDestinataire: UUID) =>
    adaptateurPersistance.lisNotificationsDe(idDestinataire);

  const sauvegardeNotificationTransactionnelle = async (
    notification: NotificationTransactionnelle
  ) => {
    await adaptateurPersistance.sauvegardeNotificationTransactionnelle(
      notification.donnees()
    );
  };

  return {
    lisNotifications,
    sauvegardeNotificationTransactionnelle,
  };
};

export type DepotDonneesNotificationsTransactionnelles = ReturnType<
  typeof creeDepot
>;

export { creeDepot };
