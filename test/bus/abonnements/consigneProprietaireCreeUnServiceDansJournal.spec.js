import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneProprietaireCreeUnServiceDansJournal } from '../../../src/bus/abonnements/consigneProprietaireCreeUnServiceDansJournal.js';

describe("L'abonnement qui consigne (dans le journal MSS) le lien entre un propriétaire et son nouveau service", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "collaboratif de service modifié" indiquant que l\'utilisateur est le propriétaire du service', async () => {
    await consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal })({
      service: unService().avecId('123').construis(),
      utilisateur: unUtilisateur().avecId('ABC').construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.be(
      'COLLABORATIF_SERVICE_MODIFIE'
    );
    const { autorisations } =
      adaptateurJournal.dernierEvenementConsigne().donnees;
    expect(autorisations.length).to.be(1);
    expect(autorisations[0].idUtilisateur).not.to.be(undefined);
    expect(autorisations[0].droit).to.be('PROPRIETAIRE');
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    try {
      await consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal })(
        {
          service: null,
          utilisateur: unUtilisateur().avecId('ABC').construis(),
        }
      );
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner le lien entre un créateur et son service dans le journal MSS sans avoir le service en paramètre.'
      );
    }
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await consigneProprietaireCreeUnServiceDansJournal({ adaptateurJournal })(
        {
          service: unService().avecId('123').construis(),
          utilisateur: null,
        }
      );
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner le lien entre un créateur et son service dans le journal MSS sans avoir le créateur en paramètre.'
      );
    }
  });
});
