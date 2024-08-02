const expect = require('expect.js');

const Service = require('../../../src/modeles/service');
const Referentiel = require('../../../src/referentiel');
const VueAnnexePDFMesures = require('../../../src/modeles/objetsPDF/objetPDFAnnexeMesures');
const { unService } = require('../../constructeurs/constructeurService');

describe("L'objet PDF de l'annexe des mesures", () => {
  const donneesReferentiel = {
    categoriesMesures: { gouvernance: 'Gouvernance', protection: 'Protection' },
    mesures: { mesure1: {} },
    niveauxGravite: { grave: {} },
    statutsMesures: { fait: 'Fait', enCours: 'En cours' },
    articlesDefinisReferentielsMesure: {
      ANSSI: "l'",
      CNIL: 'la ',
    },
  };
  const referentiel = Referentiel.creeReferentielVide();
  referentiel.enrichis(donneesReferentiel);
  const homologation = new Service(
    {
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'Nom Service' },
      mesuresGenerales: [
        { id: 'mesure1', niveauxGravite: 'grave', categorie: 'gouvernance' },
      ],
    },
    referentiel
  );

  it('fournit les statuts provenant du référentiel', () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(
      homologation,
      referentiel
    );

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).to.have.key('statuts');
    expect(donnees.statuts).to.eql(donneesReferentiel.statutsMesures);
  });

  it('fournit les catégories provenant du référentiel', () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(
      homologation,
      referentiel
    );

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).to.have.key('categories');
    expect(donnees.categories).to.eql(donneesReferentiel.categoriesMesures);
  });

  it("fournit le nom du service de l'homologation", () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(
      homologation,
      referentiel
    );

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).to.have.key('nomService');
    expect(donnees.nomService).to.equal('Nom Service');
  });

  it("fournit les mesures par statut et par catégorie de l'homologation", () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(
      homologation,
      referentiel
    );
    homologation.mesuresParStatutEtCategorie = () => ({
      grave: { gouvernance: [{ id: 'mesure1' }] },
    });

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).to.have.key('mesuresParStatut');
    expect(donnees.mesuresParStatut).to.eql({
      grave: { gouvernance: [{ id: 'mesure1' }] },
    });
  });

  it("fournit le nombre de mesures à remplir toutes catégories de l'homologation", () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(
      homologation,
      referentiel
    );
    homologation.nombreTotalMesuresARemplirToutesCategories = () => 6;

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).to.have.key('nbMesuresARemplirToutesCategories');
    expect(donnees.nbMesuresARemplirToutesCategories).to.equal(6);
  });

  it('fournit une chaine de caractères indiquant les référentiels concernés par les mesures non renseignées', () => {
    const service = unService().construis();
    service.mesures.enrichiesAvecDonneesPersonnalisees = () => ({
      mesuresGenerales: {
        mesureA: { referentiel: 'ANSSI' },
        mesureB: { referentiel: 'CNIL' },
        mesureC: { referentiel: 'CNIL' },
      },
    });
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(service, referentiel);

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees.referentielsConcernesMesuresNonRenseignees).to.equal(
      "l'ANSSI et la CNIL"
    );
  });
});
