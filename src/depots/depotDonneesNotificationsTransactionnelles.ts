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

export class DepotDonneesNotificationsTransactionnelles {
  private readonly persistance: PersistanceNotificationTransactionnelle;

  constructor({
    adaptateurPersistanceTS,
  }: {
    adaptateurPersistanceTS: PersistanceNotificationTransactionnelle;
  }) {
    this.persistance = adaptateurPersistanceTS;
  }
  async lisNotifications(idDestinataire: UUID) {
    const donnees = await this.persistance.lisNotificationsDe(idDestinataire);
    return donnees.map((d) => NotificationTransactionnelle.hydrate(d));
  }

  async sauvegardeNotificationTransactionnelle(
    notification: NotificationTransactionnelle
  ) {
    await this.persistance.sauvegardeNotificationTransactionnelle(
      notification.donnees()
    );
  }
}
