import {
  EtatNotificationTransactionnelle,
  NotificationTransactionnelle,
} from '../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

export class EvenementNotificationTransactionnelleModifiee {
  readonly notification: NotificationTransactionnelle;
  readonly etat: EtatNotificationTransactionnelle;

  constructor({
    notification,
    etat,
  }: {
    notification: NotificationTransactionnelle;
    etat: EtatNotificationTransactionnelle;
  }) {
    this.notification = notification;
    this.etat = etat;
  }
}
