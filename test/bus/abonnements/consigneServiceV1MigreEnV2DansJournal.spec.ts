import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneServiceV1MigreEnV2 } from '../../../src/bus/abonnements/consigneServiceV1MigreEnV2DansJournal.ts';
import EvenementServiceV1MigreEnV2 from '../../../src/bus/evenementServiceV1MigreEnV2.js';

describe("L'abonnement qui consigne la migration d'un service V1 vers V2 dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de service migré', async () => {
    await consigneServiceV1MigreEnV2({ adaptateurJournal })(
      new EvenementServiceV1MigreEnV2({
        service: unService().avecId('123').construis(),
        utilisateur: unUtilisateur().avecId('ABC').construis(),
      })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'SERVICE_V1_MIGRE_EN_V2'
    );
  });
});
