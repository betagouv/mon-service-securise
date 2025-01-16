const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  consigneNouvelleHomologationCreeeDansJournal,
} = require('../../../src/bus/abonnements/consigneNouvelleHomologationCreeeDansJournal');
const { unDossier } = require('../../constructeurs/constructeurDossier');
const Referentiel = require('../../../src/referentiel');

describe("L'abonnement qui consigne (dans le journal MSS) la finalisation d'un dossier d'homologation", () => {
  let adaptateurJournal;
  let referentiel;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
      statutsAvisDossierHomologation: { favorable: {} },
    });
  });

  it('consigne un événement de "nouvelle homologation créée"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    })({
      idService: '123',
      dossier: unDossier(referentiel).quiEstComplet().quiEstActif().construit(),
    });

    expect(evenementRecu.type).to.be('NOUVELLE_HOMOLOGATION_CREEE');
  });

  [
    { propriete: 'idService', nom: "l'ID du service" },
    { propriete: 'dossier', nom: 'le dossier' },
  ].forEach(({ propriete, nom }) => {
    const donnees = {
      idService: '123',
      dossier: {},
    };
    it(`lève une exception s'il ne reçoit pas ${nom}`, async () => {
      try {
        delete donnees[propriete];
        await consigneNouvelleHomologationCreeeDansJournal({
          adaptateurJournal,
          referentiel,
        })(donnees);
        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          `Impossible de consigner la finalisation d'un dossier d'homologation sans avoir ${nom} en paramètre.`
        );
      }
    });
  });
});
