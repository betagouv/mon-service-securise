import Evenement from './evenement.js';
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

class EvenementNotificationTransactionnelleModifiee extends Evenement {
  constructor(
    donnees: DonneesEvenementNotificationTransactionnelleModifiee,
    options = {}
  ) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idNotification',
      'idActeur',
      'idDestinataire',
      'idService',
      'typeNotification',
      'etat',
    ]);

    super(
      'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE',
      {
        idNotification: adaptateurChiffrement.hacheSha256(
          donnees.idNotification
        ),
        idActeur: adaptateurChiffrement.hacheSha256(donnees.idActeur),
        idDestinataire: adaptateurChiffrement.hacheSha256(
          donnees.idDestinataire
        ),
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        ...(donnees.idMesure && { idMesure: donnees.idMesure }),
        ...(donnees.typeMesure && { typeMesure: donnees.typeMesure }),
        typeNotification: donnees.typeNotification,
        etat: donnees.etat,
      },
      date
    );
  }
}

export default EvenementNotificationTransactionnelleModifiee;
