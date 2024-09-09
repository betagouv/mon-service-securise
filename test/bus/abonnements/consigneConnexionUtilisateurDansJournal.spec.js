const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  consigneConnexionUtilisateurDansJournal,
} = require('../../../src/bus/abonnements/consigneConnexionUtilisateurDansJournal');

describe("L'abonnement qui consigne (dans le journal MSS) la connexion d'un utilisateur", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "connexion utilisateur"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneConnexionUtilisateurDansJournal({ adaptateurJournal })({
      idUtilisateur: '123',
      dateDerniereConnexion: '2022-09-02',
    });

    expect(evenementRecu.type).to.be('CONNEXION_UTILISATEUR');
  });
});
