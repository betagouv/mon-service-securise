import expect from 'expect.js';
import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneServiceV1MigreEnV2 } from '../../../src/bus/abonnements/consigneServiceV1MigreEnV2DansJournal.js';

describe("L'abonnement qui consigne la migration d'un service V1 vers V2 dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de service migré', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneServiceV1MigreEnV2({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    });

    expect(evenementRecu.type).to.equal('SERVICE_V1_MIGRE_EN_V2');
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    try {
      await consigneServiceV1MigreEnV2({ adaptateurJournal })({
        service: null,
        utilisateur: unUtilisateur().avecId('ABC').construis(),
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner la migration en v2 du service dans le journal MSS sans avoir le service en paramètre.'
      );
    }
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await consigneServiceV1MigreEnV2({ adaptateurJournal })({
        service: unService().avecId('123').construis(),
        utilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner la migration en v2 du service dans le journal MSS sans avoir le créateur en paramètre.'
      );
    }
  });
});
