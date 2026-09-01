import {
  DepotDonneesNotificationsTransactionnelles,
  PersistanceNotificationTransactionnelle,
} from '../../src/depots/depotDonneesNotificationsTransactionnelles.ts';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import { unUUID } from '../constructeurs/UUID.ts';
import { NotificationTransactionnelle } from '../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';
import { fabriqueBusPourLesTests } from '../bus/aides/busPourLesTests.js';
import BusEvenements from '../../src/bus/busEvenements.js';
import { EvenementNotificationTransactionnelleModifiee } from '../../src/bus/evenementNotificationTransactionnelleModifiee.ts';

describe('Le dépôt de données des notifications transactionnelles', () => {
  let persistance: PersistanceNotificationTransactionnelle;
  let busEvenements: ReturnType<typeof fabriqueBusPourLesTests>;

  beforeEach(() => {
    persistance = unePersistanceMemoireTS().construis();
    busEvenements = fabriqueBusPourLesTests();
  });

  const unDepot = () =>
    new DepotDonneesNotificationsTransactionnelles({
      adaptateurPersistanceTS: persistance,
      busEvenements: busEvenements as unknown as BusEvenements,
    });

  const uneNotification = () =>
    NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date: new Date(),
      metadonnees: { idService: unUUID('S') },
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
      expect(notification!.donnees().id).toBe(unUUID('I'));
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

  describe("sur demande de sauvegarde d'une notification", () => {
    it('publie un évènement de notification créée sur le bus', async () => {
      const notification = uneNotification();

      await unDepot().sauvegardeNotificationTransactionnelle(notification);

      expect(
        busEvenements.aRecuUnEvenement(
          EvenementNotificationTransactionnelleModifiee
        )
      ).toBe(true);
      expect(
        busEvenements.recupereEvenement(
          EvenementNotificationTransactionnelleModifiee
        )
      ).toEqual(
        new EvenementNotificationTransactionnelleModifiee({
          notification,
          etat: 'cree',
        })
      );
    });

    it('publie un évènement de notification lue lorsque la notification est lue', async () => {
      const notification = uneNotification();
      notification.marqueCommeLue();

      await unDepot().sauvegardeNotificationTransactionnelle(notification);

      expect(
        busEvenements.recupereEvenement(
          EvenementNotificationTransactionnelleModifiee
        )
      ).toEqual(
        new EvenementNotificationTransactionnelleModifiee({
          notification,
          etat: 'lu',
        })
      );
    });
  });

  describe("sur demande de suppression d'une notification", () => {
    it('supprime la notification de la persistance', async () => {
      const notification = uneNotification();
      await persistance.sauvegardeNotificationTransactionnelle(
        notification.donnees()
      );

      await unDepot().supprimeNotificationTransactionnelle(notification);

      expect(await persistance.lisNotificationsDe(unUUID('D'))).toHaveLength(0);
    });

    it('publie un évènement de notification supprimée sur le bus', async () => {
      const notification = uneNotification();

      await unDepot().supprimeNotificationTransactionnelle(notification);

      expect(
        busEvenements.recupereEvenement(
          EvenementNotificationTransactionnelleModifiee
        )
      ).toEqual(
        new EvenementNotificationTransactionnelleModifiee({
          notification,
          etat: 'supprime',
        })
      );
    });
  });
});
