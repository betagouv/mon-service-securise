const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const BusEvenements = require('../../../../src/bus/busEvenements');
const EvenementMesuresServiceModifiees = require('../../../../src/bus/evenementMesuresServiceModifiees');
const { unService } = require('../../../constructeurs/constructeurService');
const {
  consigneCompletudeDansJournal,
} = require('../../../../src/bus/abonnements/mesuresServiceModifiees/consigneCompletudeDansJournal');
const {
  unUtilisateur,
} = require('../../../constructeurs/constructeurUtilisateur');

describe("L'abonnement à `EvenementMesuresServiceModifiees` qui consigne dans le journal MSS", () => {
  let bus;
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    bus = new BusEvenements({
      adaptateurGestionErreur: {
        logueErreur: (e) => {
          throw e;
        },
      },
    });
  });

  it('consigne un événement de changement de complétude du service', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    bus.abonne(
      EvenementMesuresServiceModifiees,
      consigneCompletudeDansJournal({ adaptateurJournal })
    );

    await bus.publie(
      new EvenementMesuresServiceModifiees({
        service: unService().construis(),
        utilisateur: unUtilisateur().construis(),
      })
    );

    expect(evenementRecu.type).to.equal('COMPLETUDE_SERVICE_MODIFIEE');
  });
});
