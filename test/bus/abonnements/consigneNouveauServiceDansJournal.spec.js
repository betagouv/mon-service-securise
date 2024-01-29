const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const { unService } = require('../../constructeurs/constructeurService');
const {
  consigneNouveauServiceDansJournal,
} = require('../../../src/bus/abonnements/consigneNouveauServiceDansJournal');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');

describe("L'abonnement qui consigne la création d'un nouveau service dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de nouveau service créé', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneNouveauServiceDansJournal({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    });

    expect(evenementRecu.type).to.equal('NOUVEAU_SERVICE_CREE');
  });
});
