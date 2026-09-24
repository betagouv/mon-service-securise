import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { consigneAcceptationCguDansJournal } from '../../../src/bus/abonnements/consigneAcceptationCguDansJournal.js';

describe("L'abonnement qui consigne (dans le journal MSS) l'acceptation des CGU par un utilisateur", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "cgu acceptées"', async () => {
    await consigneAcceptationCguDansJournal({ adaptateurJournal })({
      idUtilisateur: 'U1',
      cguAcceptees: 'v1.0',
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.be(
      'CGU_ACCEPTEES'
    );
    expect(
      adaptateurJournal.dernierEvenementConsigne().donnees.cguAcceptees
    ).to.be('v1.0');
    expect(
      adaptateurJournal.dernierEvenementConsigne().donnees.idUtilisateur
    ).not.to.be(undefined);
  });
});
