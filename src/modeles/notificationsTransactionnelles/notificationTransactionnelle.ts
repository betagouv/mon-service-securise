import { UUID } from '../../typesBasiques.js';

export type DonneesNotificationTransactionnelle = {
  idActeur: UUID;
};

export class NotificationTransactionnelle {
  private readonly idActeur: UUID;
  constructor({ idActeur }: DonneesNotificationTransactionnelle) {
    this.idActeur = idActeur;
  }

  donnees(): DonneesNotificationTransactionnelle {
    return { idActeur: this.idActeur };
  }
}
