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
});
