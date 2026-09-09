import { unUUID } from '../../constructeurs/UUID.ts';
import EvenementNotificationTransactionnelleModifiee, {
  DonneesEvenementNotificationTransactionnelleModifiee,
} from '../../../src/modeles/journalMSS/evenementNotificationTransactionnelleModifiee.ts';
import { ErreurDonneeManquante } from '../../../src/modeles/journalMSS/erreurs.js';

describe('Un événement de notification transactionnelle modifiée', () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };

  const uneNotification =
    (): DonneesEvenementNotificationTransactionnelleModifiee => ({
      idNotification: unUUID('a'),
      idActeur: unUUID('ac'),
      idDestinataire: unUUID('d'),
      idService: unUUID('s'),
      typeNotification: 'mentionDansMesure',
      etat: 'cree',
    });

  it("hache l'identifiant de la notification qui lui est donné", () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      uneNotification(),
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idNotification).toBe(unUUID('A'));
  });

  it("hache l'identifiant de l'acteur qui lui est donné", () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      uneNotification(),
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idActeur).toBe(unUUID('AC'));
  });

  it("hache l'identifiant du destinataire qui lui est donné", () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      uneNotification(),
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idDestinataire).toBe(unUUID('D'));
  });

  it("hache l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      uneNotification(),
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idService).toBe(unUUID('S'));
  });

  it('peut indiquer un id de mesure', () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      {
        ...uneNotification(),
        idMesure: 'ID_MESURE',
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idMesure).toBe('ID_MESURE');
  });

  it('peut indiquer un type de mesure', () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      {
        ...uneNotification(),
        typeMesure: 'generale',
      },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.typeMesure).toBe('generale');
  });

  it('sait se convertir en JSON', () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      uneNotification(),
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      date: '27/03/2023',
      donnees: {
        idNotification: unUUID('A'),
        idActeur: unUUID('AC'),
        idDestinataire: unUUID('D'),
        idService: unUUID('S'),
        typeNotification: 'mentionDansMesure',
        etat: 'cree',
      },
      type: 'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE',
    });
  });

  it.each([
    'idNotification',
    'idActeur',
    'idDestinataire',
    'idService',
    'typeNotification',
    'etat',
  ])('exige que `%s` soit renseigné', (propriete) => {
    expect(
      () =>
        new EvenementNotificationTransactionnelleModifiee({
          ...uneNotification(),
          [propriete]: undefined,
        })
    ).toThrow(ErreurDonneeManquante);
  });
});
