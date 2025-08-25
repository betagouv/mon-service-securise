const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  consigneAcceptationCguDansJournal,
} = require('../../../src/bus/abonnements/consigneAcceptationCguDansJournal');

describe("L'abonnement qui consigne (dans le journal MSS) l'acceptation des CGU par un utilisateur", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "cgu acceptées"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneAcceptationCguDansJournal({ adaptateurJournal })({
      idUtilisateur: 'U1',
      cguAcceptees: 'v1.0',
    });

    expect(evenementRecu.type).to.be('CGU_ACCEPTEES');
    expect(evenementRecu.donnees.cguAcceptees).to.be('v1.0');
    expect(evenementRecu.donnees.idUtilisateur).not.to.be(undefined);
  });
});
