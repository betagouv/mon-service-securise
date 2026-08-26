import { UUID } from '../../typesBasiques.js';

export type DonneesNotificationTransactionnelle =
  DonneesCreationNotificationTransactionnelle & {
    id: UUID;
  };

export type DonneesCreationNotificationTransactionnelle = {
  idActeur: UUID;
  idDestinataire: UUID;
  metadonnees: Record<string, unknown>;
  type: 'mentionDansMesure';
  date: Date;
};

export class NotificationTransactionnelle {
  private constructor(
    private readonly donneesNotification: DonneesNotificationTransactionnelle
  ) {}

  static nouveau(
    donneesNotification: DonneesCreationNotificationTransactionnelle
  ) {
    return new NotificationTransactionnelle({
      id: crypto.randomUUID(),
      ...donneesNotification,
    });
  }

  donnees(): DonneesNotificationTransactionnelle {
    return this.donneesNotification;
  }
}
