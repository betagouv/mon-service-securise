const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal,
} = require('../../../src/bus/abonnements/consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal');

describe("L'abonnement qui consigne (dans le journal MSS) la réalisation d'un téléversement de modèles de mesure spécifique", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "modèles de mesure spécifique importés"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal({
      adaptateurJournal,
    })({
      idUtilisateur: 'abc',
      nbModelesMesureSpecifiqueImportes: 42,
    });

    expect(evenementRecu.type).to.be('MODELES_MESURE_SPECIFIQUE_IMPORTES');
  });

  [
    { propriete: 'idUtilisateur', nom: "l'identifiant de l'utilisateur" },
    {
      propriete: 'nbModelesMesureSpecifiqueImportes',
      nom: 'le nombre de modèles de mesure spécifique importés',
    },
  ].forEach(({ propriete, nom }) => {
    const donnees = {
      idUtilisateur: '123',
      nbModelesMesureSpecifiqueImportes: 42,
    };
    it(`lève une exception s'il ne reçoit pas ${nom}`, async () => {
      try {
        delete donnees[propriete];
        await consigneTeleversementModelesMesureSpecifiqueRealiseDansJournal({
          adaptateurJournal,
        })(donnees);
        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          `Impossible de consigner la réalisation d'un téléversement de modèles de mesure spécifique sans avoir ${nom} en paramètre.`
        );
      }
    });
  });
});
