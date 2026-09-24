import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal } from '../../../src/bus/abonnements/consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal.ts';
import EvenementModelesMesureSpecifiqueImportes from '../../../src/bus/evenementModelesMesureSpecifiqueImportes.js';

describe("L'abonnement qui consigne (dans le journal MSS) la réalisation d'un téléversement de modèles de mesure spécifique", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "modèles de mesure spécifique importés"', async () => {
    await consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal({
      adaptateurJournal,
    })(
      new EvenementModelesMesureSpecifiqueImportes({
        idUtilisateur: 'abc',
        nbModelesMesureSpecifiqueImportes: 42,
      })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'MODELES_MESURE_SPECIFIQUE_IMPORTES'
    );
  });
});
