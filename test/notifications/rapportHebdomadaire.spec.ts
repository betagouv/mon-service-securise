import { DepotDonneesNotificationsTransactionnelles } from '../../src/depots/depotDonneesNotificationsTransactionnelles.js';
import { unePersistanceMemoireTS } from '../constructeurs/constructeurAdaptateurPersistanceMemoireTS.ts';
import {
  DonneesNotificationTransactionnelle,
  NotificationTransactionnelle,
} from '../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { RapportHebdomadaire } from '../../src/notifications/rapportHebdomadaire.ts';

describe('Le service de rapport hebdomadaire', () => {
  const idDestinataire = unUUID('D');

  const uneNotification = (
    donnees: Partial<DonneesNotificationTransactionnelle>
  ) =>
    NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire,
      type: 'mentionDansMesure',
      metadonnees: {},
      date: new Date(),
      ...donnees,
    });

  it('lis toutes les notifications non lues des 7 derniers jours', async () => {
    const hier = new Date();
    hier.setDate(hier.getDate() - 1);
    const notification = uneNotification({
      date: hier,
    }).donnees();
    const depotDonnees = new DepotDonneesNotificationsTransactionnelles({
      adaptateurPersistanceTS: unePersistanceMemoireTS()
        .ajouteNotificationTransactionnelle(notification)
        .construis(),
    });

    const rapportHebdomadaire = new RapportHebdomadaire({ depotDonnees });
    const notifications = await rapportHebdomadaire.notificationsConcernees();

    expect(notifications.get(idDestinataire)).toEqual({
      mentionDansMesure: 1,
    });
  });

  it.skip(
    "ne conserve pas les notifications pour lesquelles l'utilisateur ne souhaite pas recevoir d'email"
  );

  describe('concernant le message de contenu à envoyer', () => {
    it('met en forme le nombre de mentions dans des mesures', async () => {});
  });
});
