import Evenement, { Hacheur } from './evenement.js';
import { type UUID } from '../../typesBasiques.js';
import { type IdNotificationTransactionnelle } from '../../referentiel.types.js';
import { EtatNotificationTransactionnelle } from '../../bus/evenementNotificationTransactionnelleModifiee.js';
import { IdMesure } from '../activiteMesure.js';

export type DonneesEvenementNotificationTransactionnelleModifiee = {
  idNotification: UUID;
  idActeur: UUID;
  idDestinataire: UUID;
  idService: UUID;
  idMesure?: IdMesure;
  typeMesure?: 'generale' | 'specifique';
  typeNotification: IdNotificationTransactionnelle;
  etat: EtatNotificationTransactionnelle;
};

class EvenementNotificationTransactionnelleModifiee extends Evenement<DonneesEvenementNotificationTransactionnelleModifiee> {
  protected override typeEvenement() {
    return 'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE';
  }

  protected override proprietesRequises(): (keyof DonneesEvenementNotificationTransactionnelleModifiee)[] {
    return [
      'idNotification',
      'idActeur',
      'idDestinataire',
      'idService',
      'typeNotification',
      'etat',
    ];
  }

  protected override donneesAConsigner(
    {
      idNotification,
      idActeur,
      idDestinataire,
      idService,
      idMesure,
      typeMesure,
      typeNotification,
      etat,
    }: DonneesEvenementNotificationTransactionnelleModifiee,
    hache: Hacheur
  ) {
    return {
      idNotification: hache(idNotification),
      idActeur: hache(idActeur),
      idDestinataire: hache(idDestinataire),
      idService: hache(idService),
      ...(idMesure && { idMesure }),
      ...(typeMesure && { typeMesure }),
      typeNotification,
      etat,
    };
  }
}

export default EvenementNotificationTransactionnelleModifiee;
