import EvenementServiceRattacheAPrestataire from '../../../src/modeles/journalMSS/evenementServiceRattacheAPrestataire.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de service rattaché à un prestataire', () => {
  it("consigne l'identifiant haché du service et le code du prestataire", () => {
    const evenement = new EvenementServiceRattacheAPrestataire(
      { idService: unUUID('a'), codePrestataire: 'PRESTA-1' },
      { date: 'Une date', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'SERVICE_RATTACHE_A_PRESTATAIRE',
      donnees: { idService: unUUID('A'), codePrestataire: 'PRESTA-1' },
      date: 'Une date',
    });
  });
});
