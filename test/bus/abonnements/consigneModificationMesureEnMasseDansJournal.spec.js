const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  consigneModificationMesureEnMasseDansJournal,
} = require('../../../src/bus/abonnements/consigneModificationMesureEnMasseDansJournal');

describe("L'abonnement qui consigne la modification en masse d'une mesure dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de mesure modifiée en masse', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneModificationMesureEnMasseDansJournal({ adaptateurJournal })({
      utilisateur: unUtilisateur().avecId('ABC').construis(),
      idMesure: 'uneMesure',
      statutModifie: true,
      modalitesModifiees: false,
      nombreServicesConcernes: 2,
      type: 'generale',
    });

    expect(evenementRecu.type).to.equal('MESURE_MODIFIEE_EN_MASSE');
    expect(evenementRecu.donnees.idUtilisateur).not.to.be(undefined);
    expect(evenementRecu.donnees.idMesure).to.be('uneMesure');
    expect(evenementRecu.donnees.statutModifie).to.be(true);
    expect(evenementRecu.donnees.modalitesModifiees).to.be(false);
    expect(evenementRecu.donnees.nombreServicesConcernes).to.be(2);
    expect(evenementRecu.donnees.type).to.be('generale');
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await consigneModificationMesureEnMasseDansJournal({ adaptateurJournal })(
        {
          utilisateur: null,
        }
      );
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de consigner la mise à jour en masse d'une mesure sans avoir l'utilisateur en paramètre."
      );
    }
  });
});
