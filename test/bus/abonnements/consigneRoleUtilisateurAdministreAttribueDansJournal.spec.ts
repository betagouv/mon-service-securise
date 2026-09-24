import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneRoleUtilisateurAdministreAttribueDansJournal } from '../../../src/bus/abonnements/consigneRoleUtilisateurAdministreAttribueDansJournal.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';
import { Autorisation } from '../../../src/modeles/autorisations/autorisation.ts';

describe("L'abonnement qui consigne l'attribution d'un rôle à un utilisateur administré dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it("consigne un événement d'attribution de rôle à un utilisateur administré", async () => {
    await consigneRoleUtilisateurAdministreAttribueDansJournal({
      adaptateurJournal,
    })({
      idAdmin: unUUIDRandom(),
      idUtilisateurAdministre: unUUIDRandom(),
      role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
      idsServices: [unUUIDRandom()],
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toEqual(
      'ROLE_UTILISATEUR_ADMINISTRE_ATTRIBUE'
    );
  });

  it.each(['idAdmin', 'idUtilisateurAdministre', 'role', 'idsServices'])(
    "lève une exception s'il ne reçoit pas de %s",
    async (proprieteObligatoire) => {
      const payload = {
        idAdmin: unUUIDRandom(),
        idUtilisateurAdministre: unUUIDRandom(),
        role: Autorisation.RESUME_NIVEAU_DROIT.PROPRIETAIRE,
        idsServices: [unUUIDRandom()],
      };
      // @ts-expect-error On supprime la propriété
      delete payload[proprieteObligatoire];

      await expect(
        consigneRoleUtilisateurAdministreAttribueDansJournal({
          adaptateurJournal,
        })(payload)
      ).rejects.toThrowError(
        `Impossible de consigner une attribution de rôle à un utilisateur administré sans avoir ${proprieteObligatoire} en paramètre.`
      );
    }
  );
});
