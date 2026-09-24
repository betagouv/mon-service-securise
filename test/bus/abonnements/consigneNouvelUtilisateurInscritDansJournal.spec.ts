import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneNouvelUtilisateurInscritDansJournal } from '../../../src/bus/abonnements/consigneNouvelUtilisateurInscritDansJournal.ts';
import EvenementUtilisateurInscrit from '../../../src/bus/evenementUtilisateurInscrit.js';

describe("L'abonnement qui consigne (dans le journal MSS) l'inscription d'un utilisateur", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "nouvel utilisateur inscrit"', async () => {
    await consigneNouvelUtilisateurInscritDansJournal({ adaptateurJournal })(
      new EvenementUtilisateurInscrit({
        utilisateur: unUtilisateur().construis(),
      })
    );

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'NOUVEL_UTILISATEUR_INSCRIT'
    );
  });
});
