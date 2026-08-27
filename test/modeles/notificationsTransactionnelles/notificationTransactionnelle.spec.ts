import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Le modèle de notification transactionnelle', () => {
  const uneNotification = () =>
    NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date: new Date(),
      metadonnees: {},
    });

  it('peut être créée en insérant un `id`, non lue par défaut', () => {
    const date = new Date();

    const notification = NotificationTransactionnelle.nouveau({
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date,
      metadonnees: {},
    });

    expect(notification).toBeInstanceOf(NotificationTransactionnelle);
    expect(notification.donnees()).toEqual({
      id: expect.any(String),
      lue: false,
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date,
      metadonnees: {},
    });
  });

  it('peut être marqué comme lue', () => {
    const notification = uneNotification();

    notification.marqueCommeLue();

    expect(notification.donnees().lue).toBe(true);
  });

  it('peut être hydratée avec des données', () => {
    const date = new Date();

    const notification = NotificationTransactionnelle.hydrate({
      id: unUUID('I'),
      lue: true,
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date,
      metadonnees: { proprietes: 42 },
    });

    expect(notification).toBeInstanceOf(NotificationTransactionnelle);
    expect(notification.donnees()).toEqual({
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
