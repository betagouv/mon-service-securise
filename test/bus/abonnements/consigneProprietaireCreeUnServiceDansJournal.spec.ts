import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneProprietaireCreeUnServiceDansJournal } from '../../../src/bus/abonnements/consigneProprietaireCreeUnServiceDansJournal.ts';

describe("L'abonnement qui consigne (dans le journal MSS) le lien entre un propriétaire et son nouveau service", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "collaboratif de service modifié" indiquant que l\'utilisateur est le propriétaire du service', async () => {
    await consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    });

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
