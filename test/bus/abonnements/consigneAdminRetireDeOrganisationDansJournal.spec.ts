import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneAdminRetireDeOrganisationDansJournal } from '../../../src/bus/abonnements/consigneAdminRetireDeOrganisationDansJournal.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne le retrait d'un admin d'une organisation dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it("consigne un événement de retrait d'admin d'une organisation", async () => {
    await consigneAdminRetireDeOrganisationDansJournal({ adaptateurJournal })({
      idActeur: unUUIDRandom(),
      idCible: unUUIDRandom(),
      siret: '12345678901234',
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'ADMIN_RETIRE_DE_ORGANISATION'
    );
  });
});
