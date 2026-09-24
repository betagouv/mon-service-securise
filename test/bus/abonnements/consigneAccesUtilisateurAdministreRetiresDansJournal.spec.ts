import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneAccesUtilisateurAdministreRetiresDansJournal } from '../../../src/bus/abonnements/consigneAccesUtilisateurAdministreRetiresDansJournal.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne le retrait d'accès à un utilisateur administré dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it("consigne un événement de retrait d'accès à un utilisateur administré", async () => {
    await consigneAccesUtilisateurAdministreRetiresDansJournal({
      adaptateurJournal,
    })({
      idAdmin: unUUIDRandom(),
      idUtilisateurAdministre: unUUIDRandom(),
      idsServices: [unUUIDRandom()],
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'ACCES_UTILISATEUR_ADMINISTRE_RETIRES'
    );
  });
});
