import Evenement from './evenement.js';
import { type UUID } from '../../typesBasiques.js';
import { type IdNotificationTransactionnelle } from '../../referentiel.types.js';
import { type EtatNotificationTransactionnelle } from '../notificationsTransactionnelles/notificationTransactionnelle.js';

type DonneesEvenementNotificationTransactionnelleModifiee = {
  idNotification: UUID;
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
      'typeNotification',
      'etat',
    ]);

    super(
      'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE',
      {
        idNotification: adaptateurChiffrement.hacheSha256(
          donnees.idNotification
        ),
        typeNotification: donnees.typeNotification,
        etat: donnees.etat,
      },
      date
    );
  }
}

export default EvenementNotificationTransactionnelleModifiee;
