import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneAutorisationsModifieesDansJournal } from '../../../src/bus/abonnements/consigneAutorisationsModifieesDansJournal.ts';
import { EvenementAutorisationsServiceModifiees } from '../../../src/bus/evenementAutorisationsServiceModifiees.js';

describe("L'abonnement qui consigne (dans le journal MSS) la modification d'autorisations pour un service", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it("consigne un événement de 'collaboratif de service modifié' indiquant le résumé des autorisations du service", async () => {
    await consigneAutorisationsModifieesDansJournal({ adaptateurJournal })(
      new EvenementAutorisationsServiceModifiees({
        idService: 'S1',
        autorisations: [{ droit: 'PROPRIETAIRE', idUtilisateur: 'U1' }],
      })
    );

    const { type, donnees } = adaptateurJournal.dernierEvenementConsigne();
    expect(type).toBe('COLLABORATIF_SERVICE_MODIFIE');
    const [autorisation] = donnees.autorisations as {
      idUtilisateur: string;
      droit: string;
    }[];
    expect(autorisation.idUtilisateur).toBeDefined();
    expect(autorisation.droit).toBe('PROPRIETAIRE');
  });
});
