import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { consigneSimulationMigrationReferentielCreee } from '../../../src/bus/abonnements/consigneSimulationMigrationReferentielCreeeDansJournal.ts';

describe("L'abonnement qui consigne la création d'une simulation de migration de référentiel dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de simulation créée', async () => {
    await consigneSimulationMigrationReferentielCreee({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'SIMULATION_MIGRATION_REFERENTIEL_CREEE'
    );
  });
});
