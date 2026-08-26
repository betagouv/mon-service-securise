import { UUID } from '../../typesBasiques.js';

export type DonneesNotificationTransactionnelle = {
  idActeur: UUID;
  idDestinataire: UUID;
};

export class NotificationTransactionnelle {
  private readonly idActeur: UUID;
  private readonly idDestinataire: UUID;
  constructor({
    idActeur,
    idDestinataire,
  }: DonneesNotificationTransactionnelle) {
    this.idActeur = idActeur;
    this.idDestinataire = idDestinataire;
  }

  donnees(): DonneesNotificationTransactionnelle {
    return { idActeur: this.idActeur, idDestinataire: this.idDestinataire };
  }
}
