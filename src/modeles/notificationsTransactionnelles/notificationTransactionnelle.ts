import { UUID } from '../../typesBasiques.js';
import { IdNotificationTransactionnelle } from '../../referentiel.types.js';

export type DonneesNotificationTransactionnelle =
  DonneesCreationNotificationTransactionnelle & {
    id: UUID;
    lue: boolean;
  };

export type DonneesCreationNotificationTransactionnelle = {
  idActeur: UUID;
  idDestinataire: UUID;
  metadonnees: Record<string, unknown>;
  type: IdNotificationTransactionnelle;
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
      lue: false,
      ...donneesNotification,
    });
  }

  static hydrate(donnees: DonneesNotificationTransactionnelle) {
    return new NotificationTransactionnelle(donnees);
  }

  donnees(): DonneesNotificationTransactionnelle {
    return this.donneesNotification;
  }

  marqueCommeLue() {
    this.donneesNotification.lue = true;
  }
}
