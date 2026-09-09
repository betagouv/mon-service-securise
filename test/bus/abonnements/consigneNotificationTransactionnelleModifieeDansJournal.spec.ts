import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneNotificationTransactionnelleModifieeDansJournal } from '../../../src/bus/abonnements/consigneNotificationTransactionnelleModifieeDansJournal.ts';
import { EvenementNotificationTransactionnelleModifiee } from '../../../src/bus/evenementNotificationTransactionnelleModifiee.ts';
import {
  MetadonneesNotificationMesure,
  NotificationTransactionnelle,
} from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne une notification transactionnelle modifiée dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it('consigne un événement contenant les données de mesure', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const notification = NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date: new Date(),
      metadonnees: {
        idService: unUUID('S'),
        idMesure: 'analyseProtectionDonnees',
        typeMesure: 'generale',
      },
    });
    await consigneNotificationTransactionnelleModifieeDansJournal({
      adaptateurJournal,
    })(
      new EvenementNotificationTransactionnelleModifiee({
        notification,
        etat: 'lu',
      })
    );

    expect(evenementRecu!.type).toEqual(
      'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE'
    );
    const donnees = notification.donnees();
    const metadonnees = donnees.metadonnees as MetadonneesNotificationMesure;
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idNotification: hache(donnees.id),
      idActeur: hache(donnees.idActeur),
      idDestinataire: hache(donnees.idDestinataire),
      idService: hache(donnees.metadonnees.idService),
      idMesure: metadonnees.idMesure,
      typeMesure: metadonnees.typeMesure,
      typeNotification: donnees.type,
      etat: 'lu',
    });
  });

  it('consigne un événement ne contenant pas les données de mesure', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const notification = NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'invitationService',
      date: new Date(),
      metadonnees: {
        idService: unUUID('S'),
      },
    });
    await consigneNotificationTransactionnelleModifieeDansJournal({
      adaptateurJournal,
    })(
      new EvenementNotificationTransactionnelleModifiee({
        notification,
        etat: 'lu',
      })
    );

    expect(evenementRecu!.type).toEqual(
      'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE'
    );
    const donnees = notification.donnees();
    const hache = fabriqueAdaptateurChiffrement().hacheSha256;
    expect(evenementRecu!.donnees).toEqual({
      idNotification: hache(donnees.id),
      idActeur: hache(donnees.idActeur),
      idDestinataire: hache(donnees.idDestinataire),
      idService: hache(donnees.metadonnees.idService),
      typeNotification: donnees.type,
      etat: 'lu',
    });
  });
});
