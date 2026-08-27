import {
  DepotDonneesNotificationsTransactionnelles,
  PersistanceNotificationTransactionnelle,
} from '../../src/depots/depotDonneesNotificationsTransactionnelles.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { NotificationTransactionnelle } from '../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';

describe('Le dépôt de données des notifications transactionnelles', () => {
  let persistance: PersistanceNotificationTransactionnelle;

  beforeEach(() => {
    persistance = unePersistanceMemoireTS().construis();
  });

  const unDepot = () =>
    new DepotDonneesNotificationsTransactionnelles({
      adaptateurPersistanceTS: persistance,
    });

  it('retourne des modèles métier lors de la lecture', async () => {
    const date = new Date();
    await persistance.sauvegardeNotificationTransactionnelle({
      id: unUUID('I'),
      lue: true,
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date,
      metadonnees: { proprietes: 42 },
    });
    const depot = unDepot();

    const notifications = await depot.lisNotifications(unUUID('D'));

    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toBeInstanceOf(NotificationTransactionnelle);
    expect(notifications[0].donnees()).toEqual({
      id: unUUID('I'),
      lue: true,
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date,
      metadonnees: { proprietes: 42 },
    });
  });

  describe("sur demande de lecture d'une notification", () => {
    it('peut lire une notification par son id et son destinataire', async () => {
      await persistance.sauvegardeNotificationTransactionnelle({
        id: unUUID('I'),
        lue: false,
        idActeur: unUUID('A'),
        idDestinataire: unUUID('D'),
        type: 'mentionDansMesure',
        date: new Date(),
        metadonnees: { proprietes: 42 },
      });
      const depot = unDepot();

      const notification = await depot.lisNotificationDe(
        unUUID('I'),
        unUUID('D')
      );

      expect(notification).toBeInstanceOf(NotificationTransactionnelle);
      expect(notification.donnees().id).toBe(unUUID('I'));
    });

    it("reste robuste si la notification n'existe pas", async () => {
      const depot = unDepot();

      const notification = await depot.lisNotificationDe(
        unUUID('I'),
        unUUID('D')
      );

      expect(notification).toBeUndefined();
    });
  });
});
