import { NotificationTransactionnelle } from '../../../src/modeles/notificationsTransactionnelles/notificationTransactionnelle.ts';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Le modèle de notification transactionnelle', () => {
  it('peut être créée en insérant un `id`', () => {
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
      idActeur: unUUID('A'),
      idDestinataire: unUUID('D'),
      type: 'mentionDansMesure',
      date,
      metadonnees: {},
    });
  });
});
