const expect = require('expect.js');
const AdaptateurPersistanceMemoire = require('../../src/adaptateurs/adaptateurPersistanceMemoire');
const copie = require('../../src/utilitaires/copie');
const AdaptateurJournalMSSMemoire = require('../../src/adaptateurs/adaptateurJournalMSSMemoire');
const Referentiel = require('../../src/referentiel');
const DepotDonneesHomologations = require('../../src/depots/depotDonneesHomologations');
const uneDescriptionValide = require('../constructeurs/constructeurDescriptionService');
const DepotDonneesServices = require('../../src/depots/depotDonneesServices');
const { ErreurDonneesObligatoiresManquantes } = require('../../src/erreurs');
const {
  MiseAJourDescriptionService,
} = require('../../src/casUsages/miseAJourDescriptionService');

describe("la mise à jour de la description du service d'une homologation", () => {
  let adaptateurPersistance;
  let adaptateurJournalMSS;
  let depot;
  let referentiel;
  let maj;

  beforeEach(() => {
    const donneesHomologation = {
      id: '123',
      descriptionService: {
        nomService: 'Super Service',
        presentation: 'Une présentation',
      },
    };
    adaptateurPersistance = AdaptateurPersistanceMemoire.nouvelAdaptateur({
      autorisations: [
        { idUtilisateur: '999', idHomologation: '123', type: 'createur' },
      ],
      utilisateurs: [{ id: '999', email: 'jean.dupont@mail.fr' }],
      homologations: [copie(donneesHomologation)],
      services: [copie(donneesHomologation)],
    });
    adaptateurJournalMSS = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    referentiel = Referentiel.creeReferentielVide();

    depot = DepotDonneesHomologations.creeDepot({
      adaptateurPersistance,
      adaptateurJournalMSS,
      referentiel,
    });

    maj = new MiseAJourDescriptionService(depot, adaptateurJournalMSS);
  });

  it("met à jour la description du service d'une homologation", async () => {
    const description = uneDescriptionValide(referentiel)
      .avecNomService('Nouveau Nom')
      .construis();
    const homologation = await depot.homologation('123');

    await maj.execute(homologation, description, '999');

    const { descriptionService } = await depot.homologation('123');
    expect(descriptionService.nomService).to.equal('Nouveau Nom');
  });

  it("met à jour la description de service dans l'objet métier service", async () => {
    const depotServices = DepotDonneesServices.creeDepot({
      adaptateurPersistance,
      referentiel,
    });
    const description = uneDescriptionValide(referentiel)
      .avecNomService('Nouveau Nom')
      .construis();
    const homologation = await depot.homologation('123');

    await maj.execute(homologation, description, '999');

    const { descriptionService } = await depotServices.service('123');
    expect(descriptionService.nomService).to.equal('Nouveau Nom');
  });

  it('lève une exception si des propriétés obligatoires ne sont pas renseignées', async () => {
    const descriptionIncomplete = uneDescriptionValide(referentiel)
      .avecNomService('')
      .construis();
    const homologation = await depot.homologation('123');
    let aucuneErreur;

    try {
      await maj.execute(homologation, descriptionIncomplete, '999');
      aucuneErreur = true;
    } catch (e) {
      expect(e).to.be.an(ErreurDonneesObligatoiresManquantes);
      expect(e.message).to.equal(
        'Certaines données obligatoires ne sont pas renseignées'
      );
    } finally {
      expect(aucuneErreur).not.to.be(true);
    }
  });

  it('consigne un événement de changement de complétude du service', async () => {
    let evenementRecu;
    adaptateurJournalMSS.consigneEvenement = (evenement) => {
      evenementRecu = evenement;
    };
    const description = uneDescriptionValide(referentiel).construis();
    const homologation = await depot.homologation('123');

    await maj.execute(homologation, description, '999');

    expect(evenementRecu.type).to.equal('COMPLETUDE_SERVICE_MODIFIEE');
  });
});
