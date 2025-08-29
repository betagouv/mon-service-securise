import expect from 'expect.js';
import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneNouvelUtilisateurInscritDansJournal } from '../../../src/bus/abonnements/consigneNouvelUtilisateurInscritDansJournal.js';

describe("L'abonnement qui consigne (dans le journal MSS) l'inscription d'un utilisateur", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "nouvel utilisateur inscrit"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneNouvelUtilisateurInscritDansJournal({ adaptateurJournal })({
      utilisateur: unUtilisateur().construis(),
    });

    expect(evenementRecu.type).to.be('NOUVEL_UTILISATEUR_INSCRIT');
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await consigneNouvelUtilisateurInscritDansJournal({ adaptateurJournal })({
        utilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de consigner l'inscription d'un utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
  });
});
