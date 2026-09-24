import EvenementCguAcceptees from '../../../src/modeles/journalMSS/evenementCguAcceptees.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de CGU acceptées', () => {
  it("consigne l'identifiant haché de l'utilisateur et la version des CGU", () => {
    const evenement = new EvenementCguAcceptees(
      { idUtilisateur: unUUID('a'), cguAcceptees: '1.0' },
      {
        date: new Date('2025-08-05 15:01:08.975 +0200'),
        adaptateurChiffrement: hacheEnMajuscules,
      }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'CGU_ACCEPTEES',
      donnees: { idUtilisateur: unUUID('A'), cguAcceptees: '1.0' },
      date: new Date('2025-08-05 15:01:08.975 +0200'),
    });
  });
});
