import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneAcceptationCguDansJournal } from '../../../src/bus/abonnements/consigneAcceptationCguDansJournal.ts';
import { EvenementCguAccepteesParUtilisateur } from '../../../src/bus/evenementCguAccepteesParUtilisateur.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne (dans le journal MSS) l'acceptation des CGU par un utilisateur", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "cgu acceptées"', async () => {
    await consigneAcceptationCguDansJournal({ adaptateurJournal })(
      new EvenementCguAccepteesParUtilisateur({
        idUtilisateur: unUUID('U'),
        cguAcceptees: 'v1.0',
      })
    );

    const { type, donnees } = adaptateurJournal.dernierEvenementConsigne();
    expect(type).toBe('CGU_ACCEPTEES');
    expect(donnees.cguAcceptees).toBe('v1.0');
    expect(donnees.idUtilisateur).toBeDefined();
  });
});
