import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { consigneSimulationMigrationReferentielCreee } from '../../../src/bus/abonnements/consigneSimulationMigrationReferentielCreeeDansJournal.js';

describe("L'abonnement qui consigne la création d'une simulation de migration de référentiel dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de simulation créée', async () => {
    await consigneSimulationMigrationReferentielCreee({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.equal(
      'SIMULATION_MIGRATION_REFERENTIEL_CREEE'
    );
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    await expect(
      consigneSimulationMigrationReferentielCreee({ adaptateurJournal })({
        // @ts-expect-error On force volontairement la valeur `null` pour déclencher une erreur
        service: null,
      })
    ).rejects.toThrow(
      'Impossible de consigner la création de simulation de migration du référentiel dans le journal MSS sans avoir le service en paramètre.'
    );
  });
});
