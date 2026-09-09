import { AdaptateurJournalMSS } from '../../adaptateurs/adaptateurJournalMSS.interface.js';
import EvenementNotificationTransactionnelleModifieeJournal from '../../modeles/journalMSS/evenementNotificationTransactionnelleModifiee.js';
import { EvenementNotificationTransactionnelleModifiee } from '../evenementNotificationTransactionnelleModifiee.js';
import {
  MetadonneesNotificationExpirationHomologation,
  MetadonneesNotificationMesure,
  MetadonneesNotificationService,
} from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

export const consigneNotificationTransactionnelleModifieeDansJournal =
  ({ adaptateurJournal }: { adaptateurJournal: AdaptateurJournalMSS }) =>
  async ({
    notification,
    etat,
  }: EvenementNotificationTransactionnelleModifiee) => {
    const { id, idActeur, idDestinataire, metadonnees, type } =
      notification.donnees();

    const estMetadonneeMesure = (
      metadonnee:
        | MetadonneesNotificationMesure
        | MetadonneesNotificationExpirationHomologation
        | MetadonneesNotificationService
    ): metadonnee is MetadonneesNotificationMesure =>
      (metadonnee as MetadonneesNotificationMesure).idMesure !== undefined;

    const evenement = new EvenementNotificationTransactionnelleModifieeJournal({
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

    await adaptateurJournal.consigneEvenement(evenement.toJSON());
  };
