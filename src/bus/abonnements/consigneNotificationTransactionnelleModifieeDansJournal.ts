import { consigneDansJournal } from './consigneDansJournal.js';
import EvenementNotificationTransactionnelleModifieeJournal from '../../modeles/journalMSS/evenementNotificationTransactionnelleModifiee.js';
import { EvenementNotificationTransactionnelleModifiee } from '../evenementNotificationTransactionnelleModifiee.js';
import {
  MetadonneesNotificationExpirationHomologation,
  MetadonneesNotificationMesure,
  MetadonneesNotificationService,
} from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

const estMetadonneeMesure = (
  metadonnee:
    | MetadonneesNotificationMesure
    | MetadonneesNotificationExpirationHomologation
    | MetadonneesNotificationService
): metadonnee is MetadonneesNotificationMesure =>
  (metadonnee as MetadonneesNotificationMesure).idMesure !== undefined;

const consigneNotificationTransactionnelleModifieeDansJournal =
  consigneDansJournal(
    ({ notification, etat }: EvenementNotificationTransactionnelleModifiee) => {
      const { id, idActeur, idDestinataire, metadonnees, type } =
        notification.donnees();

      return new EvenementNotificationTransactionnelleModifieeJournal({
        idNotification: id,
        idActeur,
        idDestinataire,
        idService: metadonnees.idService,
        idMesure: estMetadonneeMesure(metadonnees)
          ? metadonnees.idMesure
          : undefined,
        typeMesure: estMetadonneeMesure(metadonnees)
          ? metadonnees.typeMesure
          : undefined,
        typeNotification: type,
        etat,
      });
    }
  );

export { consigneNotificationTransactionnelleModifieeDansJournal };
