import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneNouveauServiceDansJournal } from '../../../src/bus/abonnements/consigneNouveauServiceDansJournal.ts';

describe("L'abonnement qui consigne la création d'un nouveau service dans le journal MSS", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de nouveau service créé', async () => {
    await consigneNouveauServiceDansJournal({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'NOUVEAU_SERVICE_CREE'
    );
  });
});
