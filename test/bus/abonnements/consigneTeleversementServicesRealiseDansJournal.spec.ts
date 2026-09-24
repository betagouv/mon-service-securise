import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneTeleversementServicesRealiseDansJournal } from '../../../src/bus/abonnements/consigneTeleversementServicesRealiseDansJournal.ts';
import EvenementServicesImportes from '../../../src/bus/evenementServicesImportes.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne (dans le journal MSS) la réalisation d'un téléversement de services", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "services importés"', async () => {
    await consigneTeleversementServicesRealiseDansJournal({
      adaptateurJournal,
    })(
      new EvenementServicesImportes({
        idUtilisateur: unUUID('a'),
        nbServicesImportes: 42,
        versionServicesImportes: undefined,
      })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'SERVICES_IMPORTES'
    );
  });
});
