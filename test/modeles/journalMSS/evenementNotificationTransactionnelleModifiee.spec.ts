import EvenementNotificationTransactionnelleModifiee, {
  DonneesEvenementNotificationTransactionnelleModifiee,
} from '../../../src/modeles/journalMSS/evenementNotificationTransactionnelleModifiee.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de notification transactionnelle modifiée', () => {
  const uneNotification =
    (): DonneesEvenementNotificationTransactionnelleModifiee => ({
      idNotification: unUUID('a'),
      idActeur: unUUID('ac'),
      idDestinataire: unUUID('d'),
      idService: unUUID('s'),
      typeNotification: 'mentionDansMesure',
      etat: 'cree',
    });

  it("consigne les identifiants hachés de la notification, des acteurs et du service, ainsi que le type et l'état", () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      uneNotification(),
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'NOTIFICATION_TRANSACTIONNELLE_MODIFIEE',
      donnees: {
        idNotification: unUUID('A'),
        idActeur: unUUID('AC'),
        idDestinataire: unUUID('D'),
        idService: unUUID('S'),
        typeNotification: 'mentionDansMesure',
        etat: 'cree',
      },
      date: '27/03/2023',
    });
  });

  it('peut consigner un identifiant et un type de mesure', () => {
    const evenement = new EvenementNotificationTransactionnelleModifiee(
      { ...uneNotification(), idMesure: 'ID_MESURE', typeMesure: 'generale' },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.donnees.idMesure).toBe('ID_MESURE');
    expect(evenement.donnees.typeMesure).toBe('generale');
  });
});
