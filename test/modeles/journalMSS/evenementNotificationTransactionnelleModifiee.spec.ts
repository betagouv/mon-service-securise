import { unUUID } from '../../constructeurs/UUID.ts';
import EvenementNotificationTransactionnelleModifiee from '../../../src/modeles/journalMSS/evenementNotificationTransactionnelleModifiee.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';

describe('Un événement de notification transactionnelle modifiée', () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  it("hache l'identifiant de la notification qui lui est donné", () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      {
        idNotification: unUUID('a'),
        typeNotification: 'mentionDansMesure',
        etat: 'cree',
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idNotification).toBe(unUUID('A'));
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      {
        idNotification: unUUID('a'),
        typeNotification: 'mentionDansMesure',
        etat: 'lu',
      },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      date: '27/03/2023',
      donnees: {
        idNotification: unUUID('A'),
        typeNotification: 'mentionDansMesure',
        etat: 'lu',
      },
      type: 'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE',
    });
  });

  it('exige que toutes les données soient renseignées', () => {
    expect(
      () =>
        new EvenementNotificationTransactionnelleModifiee({
          // @ts-expect-error On force volontairement une valeur nulle pour provoquer l'erreur
          idNotification: undefined,
          typeNotification: 'mentionDansMesure',
          etat: 'cree',
        })
    ).toThrow(ErreurDonneeManquante);

    expect(
      () =>
        new EvenementNotificationTransactionnelleModifiee({
          idNotification: unUUID('a'),
          // @ts-expect-error On force volontairement une valeur nulle pour provoquer l'erreur
          typeNotification: undefined,
          etat: 'cree',
        })
    ).toThrow(ErreurDonneeManquante);

    expect(
      () =>
        new EvenementNotificationTransactionnelleModifiee({
          idNotification: unUUID('a'),
          typeNotification: 'mentionDansMesure',
          // @ts-expect-error On force volontairement une valeur nulle pour provoquer l'erreur
          etat: undefined,
        })
    ).toThrow(ErreurDonneeManquante);
  });
});
