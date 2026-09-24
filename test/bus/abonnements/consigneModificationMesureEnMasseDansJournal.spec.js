import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneModificationMesureEnMasseDansJournal } from '../../../src/bus/abonnements/consigneModificationMesureEnMasseDansJournal.js';

describe("L'abonnement qui consigne la modification en masse d'une mesure dans le journal MSS", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de mesure modifiée en masse', async () => {
    await consigneModificationMesureEnMasseDansJournal({ adaptateurJournal })({
      utilisateur: unUtilisateur().avecId('ABC').construis(),
      idMesure: 'uneMesure',
      statutModifie: true,
      modalitesModifiees: false,
      nombreServicesConcernes: 2,
      type: 'generale',
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.equal(
      'MESURE_MODIFIEE_EN_MASSE'
    );
    expect(
      adaptateurJournal.dernierEvenementConsigne().donnees.idUtilisateur
    ).not.to.be(undefined);
    expect(adaptateurJournal.dernierEvenementConsigne().donnees.idMesure).to.be(
      'uneMesure'
    );
    expect(
      adaptateurJournal.dernierEvenementConsigne().donnees.statutModifie
    ).to.be(true);
    expect(
      adaptateurJournal.dernierEvenementConsigne().donnees.modalitesModifiees
    ).to.be(false);
    expect(
      adaptateurJournal.dernierEvenementConsigne().donnees
        .nombreServicesConcernes
    ).to.be(2);
    expect(adaptateurJournal.dernierEvenementConsigne().donnees.type).to.be(
      'generale'
    );
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
