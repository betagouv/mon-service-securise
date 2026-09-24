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

    expect(adaptateurJournal.dernierEvenementConsigne().type).toEqual(
      'ACCES_UTILISATEUR_ADMINISTRE_RETIRES'
    );
  });

  it.each(['idAdmin', 'idUtilisateurAdministre', 'idsServices'])(
    "lève une exception s'il ne reçoit pas de %s",
    async (proprieteObligatoire) => {
      const payload = {
        idAdmin: unUUIDRandom(),
        idUtilisateurAdministre: unUUIDRandom(),
        idsServices: [unUUIDRandom()],
      };
      // @ts-expect-error On supprime la propriété
      delete payload[proprieteObligatoire];

      await expect(
        consigneAccesUtilisateurAdministreRetiresDansJournal({
          adaptateurJournal,
        })(payload)
      ).rejects.toThrow(
        `Impossible de consigner un retrait d'accès à un utilisateur administré sans avoir ${proprieteObligatoire} en paramètre.`
      );
    }
  );
});
