import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneNotificationTransactionnelleModifieeDansJournal } from '../../../src/bus/abonnements/consigneNotificationTransactionnelleModifieeDansJournal.ts';
import { EvenementNotificationTransactionnelleModifiee } from '../../../src/bus/evenementNotificationTransactionnelleModifiee.ts';
import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { fabriqueAdaptateurChiffrement } from '../../../src/adaptateurs/fabriqueAdaptateurChiffrement.js';

describe("L'abonnement qui consigne une notification transactionnelle modifiée dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  const uneNotification = () =>
    NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date: new Date(),
      metadonnees: {},
    });

  it("consigne un événement contenant le type et l'état de la notification", async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneNotificationTransactionnelleModifieeDansJournal({
      adaptateurJournal,
    })(
      new EvenementNotificationTransactionnelleModifiee({
        notification: uneNotification(),
        etat: 'lu',
      })
    );

    expect(evenementRecu!.type).toEqual(
      'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE'
    );
    expect(evenementRecu!.donnees.typeNotification).toEqual(
      'mentionDansMesure'
    );
    expect(evenementRecu!.donnees.etat).toEqual('lu');
  });

  it("hache l'identifiant de la notification", async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    const notification = uneNotification();

    await consigneNotificationTransactionnelleModifieeDansJournal({
      adaptateurJournal,
    })(
      new EvenementNotificationTransactionnelleModifiee({
        notification,
        etat: 'cree',
      })
    );

    expect(evenementRecu!.donnees.idNotification).toEqual(
      fabriqueAdaptateurChiffrement().hacheSha256(notification.donnees().id)
    );
  });
});
