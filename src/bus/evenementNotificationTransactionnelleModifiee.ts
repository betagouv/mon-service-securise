import { EvenementMetier } from './evenementMetier.js';
import { NotificationTransactionnelle } from '../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

export type EtatNotificationTransactionnelle =
  'cree' | 'lu' | 'supprime-par-utilisateur' | 'supprime-par-systeme';

type Donnees = {
  notification: NotificationTransactionnelle;
  etat: EtatNotificationTransactionnelle;
};

export class EvenementNotificationTransactionnelleModifiee extends EvenementMetier<Donnees>(
  ['notification', 'etat']
) {}
