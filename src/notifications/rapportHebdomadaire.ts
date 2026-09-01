import { DepotDonneesNotificationsTransactionnelles } from '../depots/depotDonneesNotificationsTransactionnelles.js';
import { IdNotificationTransactionnelle } from '../referentiel.types.js';

export type NombreNotificationsParType = Partial<
  Record<IdNotificationTransactionnelle, number>
>;

export class RapportHebdomadaire {
  constructor(
    private readonly configuration: {
      depotDonnees: DepotDonneesNotificationsTransactionnelles;
    }
  ) {}

  async notificationsConcernees() {
    return this.configuration.depotDonnees.lisRapportNotifications();
  }
}
