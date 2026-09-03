import { UUID } from '../../typesBasiques.js';
import { IdNotificationTransactionnelle } from '../../referentiel.types.js';
import { IdMesureV1 } from '../../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../../donneesReferentielMesuresV2.js';

export type EtatNotificationTransactionnelle = 'cree' | 'lu' | 'supprime';

type IdMesure = IdMesureV1 | IdMesureV2 | UUID;

type MetadonneesParType = {
  mentionDansMesure: {
    idMesure: IdMesure;
    idService: UUID;
    typeMesure: 'generale' | 'specifique';
  };
  responsableMesure: {
    idMesure: IdMesure;
    idService: UUID;
    typeMesure: 'generale' | 'specifique';
  };
  echeanceMesureBientotExpiree: {
    idMesure: IdMesure;
    idService: UUID;
    typeMesure: 'generale' | 'specifique';
  };
};

type BaseNotificationTransactionnelle = {
  idActeur: UUID;
  idDestinataire: UUID;
  date: Date;
};

export type DonneesCreationNotificationTransactionnelle = {
  [K in IdNotificationTransactionnelle]: BaseNotificationTransactionnelle & {
    type: K;
    metadonnees: MetadonneesParType[K];
  };
}[IdNotificationTransactionnelle];

export type DonneesNotificationTransactionnelle =
  DonneesCreationNotificationTransactionnelle & {
    id: UUID;
    lue: boolean;
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
