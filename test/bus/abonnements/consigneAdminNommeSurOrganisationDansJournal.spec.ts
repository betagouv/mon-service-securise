import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneAdminNommeSurOrganisationDansJournal } from '../../../src/bus/abonnements/consigneAdminNommeSurOrganisationDansJournal.ts';
import { unUUIDRandom } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne la nomination d'un admin sur une organisation dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it("consigne un événement de nomination d'admin sur une organisation", async () => {
    await consigneAdminNommeSurOrganisationDansJournal({
      adaptateurJournal,
    })({
      idActeur: unUUIDRandom(),
      idCible: unUUIDRandom(),
      siret: '12345678901234',
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toEqual(
      'ADMIN_NOMME_SUR_ORGANISATION'
    );
  });

  it.each(['idActeur', 'idCible', 'siret'])(
    "lève une exception s'il ne reçoit pas de %s",
    async (proprieteObligatoire) => {
      const payload = {
        idActeur: unUUIDRandom(),
        idCible: unUUIDRandom(),
        siret: '12345678901234',
      };
      // @ts-expect-error On supprime la propriété
      delete payload[proprieteObligatoire];

      await expect(
        consigneAdminNommeSurOrganisationDansJournal({
          adaptateurJournal,
        })(payload)
      ).rejects.toThrow(
        `Impossible de consigner une nomination d'admin sur une organisation sans avoir ${proprieteObligatoire} en paramètre.`
      );
    }
  );
});
