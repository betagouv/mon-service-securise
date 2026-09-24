import EvenementServiceSupprime from '../../../src/modeles/journalMSS/evenementServiceSupprime.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de service supprimé', () => {
  it("consigne l'identifiant haché du service", () => {
    const evenement = new EvenementServiceSupprime(
      { idService: unUUID('a') },
      { date: '17/11/2022', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'SERVICE_SUPPRIME',
      donnees: { idService: unUUID('A') },
      date: '17/11/2022',
    });
  });
});
