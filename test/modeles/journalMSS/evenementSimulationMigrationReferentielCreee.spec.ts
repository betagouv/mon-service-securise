import EvenementSimulationMigrationReferentielCreee from '../../../src/modeles/journalMSS/evenementSimulationMigrationReferentielCreee.ts';
import { hacheEnMajuscules } from '../../mocks/adaptateurChiffrementQuiHacheEnMajuscules.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe('Un événement de création de simulation de migration de référentiel', () => {
  it("consigne l'identifiant haché du service", () => {
    const evenement = new EvenementSimulationMigrationReferentielCreee(
      { idService: unUUID('a') },
      { date: '27/03/2023', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'SIMULATION_MIGRATION_REFERENTIEL_CREEE',
      donnees: { idService: unUUID('A') },
      date: '27/03/2023',
    });
  });
});
