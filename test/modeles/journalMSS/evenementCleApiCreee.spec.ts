import EvenementCleApiCreee from '../../../src/modeles/journalMSS/evenementCleApiCreee.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("Un événement de clé d'API créée", () => {
  it("consigne les identifiants hachés de la clé et de l'utilisateur, et les dates de la clé", () => {
    const evenement = new EvenementCleApiCreee(
      {
        idCle: unUUID('c'),
        idUtilisateur: unUUID('u'),
        dureeValiditeEnJours: 30,
        dateCreation: new Date('2026-09-01T10:00:00Z'),
        dateExpiration: new Date('2026-10-01T10:00:00Z'),
      },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'CLE_API_CREEE',
      donnees: {
        idCle: unUUID('C'),
        idUtilisateur: unUUID('U'),
        dureeValiditeEnJours: 30,
        dateCreation: new Date('2026-09-01T10:00:00Z'),
        dateExpiration: new Date('2026-10-01T10:00:00Z'),
      },
      date: '27/03/2023',
    });
  });
});
