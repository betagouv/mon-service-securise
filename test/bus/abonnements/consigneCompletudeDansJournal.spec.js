const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const { unService } = require('../../constructeurs/constructeurService');
const {
  consigneCompletudeDansJournal,
} = require('../../../src/bus/abonnements/consigneCompletudeDansJournal');
const fauxAdaptateurRechercheEntreprise = require('../../mocks/adaptateurRechercheEntreprise');

describe("L'abonnement qui consigne la complétude dans le journal MSS", () => {
  let adaptateurJournal;
  let adaptateurRechercheEntreprise;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    adaptateurRechercheEntreprise = fauxAdaptateurRechercheEntreprise();
  });

  it('consigne un événement de changement de complétude du service', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneCompletudeDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    })({
      service: unService().construis(),
    });

    expect(evenementRecu.type).to.equal('COMPLETUDE_SERVICE_MODIFIEE');
  });

  it("complète les données de l'évènement avec les détails de l'organisation responsable du service", async () => {
    const entite = {
      activitePrincipale: '68.20B',
    };
    adaptateurRechercheEntreprise.recupereDetailsOrganisation = async () =>
      entite;

    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    const service = unService()
      .avecOrganisationResponsable({
        nom: 'MonAgglo',
        siret: '12345',
        departement: '33',
      })
      .construis();

    await consigneCompletudeDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    })({
      service,
    });

    expect(evenementRecu.donnees.organisationResponsable).to.eql(entite);
  });

  it("ne complète pas les détails de l'organisation responsable si l'organisation n'a pas de SIRET (car on n'a pas pu rattraper automatiquement les données de ce champ)", async () => {
    adaptateurRechercheEntreprise.recupereDetailsOrganisation = async () =>
      expect().fail(
        "L'adaptateur ne devrait pas être appelé pour un service dont l'organisation responsable n'a pas de SIRET"
      );

    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    const service = unService()
      .avecOrganisationResponsable({
        nom: 'MonAgglo',
      })
      .construis();

    await consigneCompletudeDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    })({
      service,
    });

    expect(evenementRecu.donnees.organisationResponsable).to.eql({});
  });

  it("lève une exception s'il ne reçoit pas de service", async () => {
    try {
      await consigneCompletudeDansJournal({
        adaptateurJournal,
        adaptateurRechercheEntreprise,
      })({
        service: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        'Impossible de consigner la complétude dans le journal MSS sans avoir le service en paramètre.'
      );
    }
  });
});
