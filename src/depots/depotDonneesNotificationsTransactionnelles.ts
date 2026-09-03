import { UUID } from '../typesBasiques.js';
import {
  DonneesNotificationTransactionnelle,
  NotificationTransactionnelle,
} from '../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import { NombreNotificationsParType } from '../notifications/rapportHebdomadaire.js';
import BusEvenements from '../bus/busEvenements.js';
import { EvenementNotificationTransactionnelleModifiee } from '../bus/evenementNotificationTransactionnelleModifiee.js';

export type PersistanceNotificationTransactionnelle = {
  lisNotificationsDe(
    idDestinataire: UUID
  ): Promise<DonneesNotificationTransactionnelle[]>;
  lisNotificationDe(
    idNotification: UUID,
    idDestinataire: UUID
  ): Promise<DonneesNotificationTransactionnelle | undefined>;
  lisRapportNotifications(): Promise<Map<UUID, NombreNotificationsParType>>;
  sauvegardeNotificationTransactionnelle(
    donnees: DonneesNotificationTransactionnelle
  ): Promise<void>;
  supprimeNotificationTransactionnelle(idNotification: UUID): Promise<void>;
  supprimeNotificationsTransactionnellesDuService(
    idService: UUID
  ): Promise<void>;
};

export class DepotDonneesNotificationsTransactionnelles {
  private readonly persistance: PersistanceNotificationTransactionnelle;
  private readonly busEvenements: BusEvenements;

  constructor({
    adaptateurPersistanceTS,
    busEvenements,
  }: {
    adaptateurPersistanceTS: PersistanceNotificationTransactionnelle;
    busEvenements: BusEvenements;
  }) {
    this.persistance = adaptateurPersistanceTS;
    this.busEvenements = busEvenements;
  }
  async lisNotifications(idDestinataire: UUID) {
    const donnees = await this.persistance.lisNotificationsDe(idDestinataire);
    return donnees.map((d) => NotificationTransactionnelle.hydrate(d));
  }

  async lisNotificationDe(idNotification: UUID, idDestinataire: UUID) {
    const donnees = await this.persistance.lisNotificationDe(
      idNotification,
      idDestinataire
    );
    if (!donnees) return undefined;

    return NotificationTransactionnelle.hydrate(donnees);
  }

  async lisRapportNotifications() {
    return this.persistance.lisRapportNotifications();
  }

  async sauvegardeNotificationTransactionnelle(
    notification: NotificationTransactionnelle
  ) {
    await this.persistance.sauvegardeNotificationTransactionnelle(
      notification.donnees()
    );

    await this.busEvenements.publie(
      new EvenementNotificationTransactionnelleModifiee({
        notification,
        etat: notification.donnees().lue ? 'lu' : 'cree',
      })
    );
  }

  async supprimeNotificationTransactionnelle(
    notification: NotificationTransactionnelle
  ) {
    await this.persistance.supprimeNotificationTransactionnelle(
      notification.donnees().id
    );

    await this.busEvenements.publie(
      new EvenementNotificationTransactionnelleModifiee({
        notification,
        etat: 'supprime',
      })
    );
  }

  async supprimeNotificationsTransactionnellesDuService(idService: UUID) {
    await this.persistance.supprimeNotificationsTransactionnellesDuService(
      idService
    );
  }
}
