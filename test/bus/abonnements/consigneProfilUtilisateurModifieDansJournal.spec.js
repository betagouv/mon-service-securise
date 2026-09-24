import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneProfilUtilisateurModifieDansJournal } from '../../../src/bus/abonnements/consigneProfilUtilisateurModifieDansJournal.js';

describe("L'abonnement qui consigne (dans le journal MSS) la mise à jour du profil d'un utilisateur", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "profil utilisateur modifié"', async () => {
    await consigneProfilUtilisateurModifieDansJournal({
      adaptateurJournal,
    })({
      utilisateur: unUtilisateur().construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.be(
      'PROFIL_UTILISATEUR_MODIFIE'
    );
  });

  it("complète l'évènement avec les détails de l'utilisateur", async () => {
    await consigneProfilUtilisateurModifieDansJournal({
      adaptateurJournal,
    })({
      utilisateur: unUtilisateur()
        .avecId('123')
        .avecPostes(['AB', 'CD'])
        .quiTravaillePourUneEntiteAvecSiret('12345')
        .construis(),
    });

    expect(
      adaptateurJournal.dernierEvenementConsigne().donnees.idUtilisateur
    ).to.not.be(null);
    expect(adaptateurJournal.dernierEvenementConsigne().donnees.roles).to.eql([
      'AB',
      'CD',
    ]);
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await consigneProfilUtilisateurModifieDansJournal({
        adaptateurJournal,
      })({
        utilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de consigner les mises à jour de profil utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
  });
});
