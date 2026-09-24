import EvenementCleApiRevoquee from '../../../src/modeles/journalMSS/evenementCleApiRevoquee.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("Un événement de clé d'API révoquée", () => {
  it("consigne les identifiants hachés de la clé et de l'utilisateur, et la date de révocation", () => {
    const evenement = new EvenementCleApiRevoquee(
      {
        idCle: unUUID('c'),
        idUtilisateur: unUUID('u'),
        dateRevocation: new Date('2026-09-15T10:00:00Z'),
      },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'CLE_API_REVOQUEE',
      donnees: {
        idCle: unUUID('C'),
        idUtilisateur: unUUID('U'),
        dateRevocation: new Date('2026-09-15T10:00:00Z'),
      },
      date: '27/03/2023',
    });
  });
});
