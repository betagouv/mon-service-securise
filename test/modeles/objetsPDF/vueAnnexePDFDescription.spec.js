const expect = require('expect.js');

const Homologation = require('../../../src/modeles/homologation');
const Referentiel = require('../../../src/referentiel');
const VueAnnexePDFDescription = require('../../../src/modeles/objetsPDF/vueAnnexePDFDescription');

describe("L'objet PDF de l'annexe de description", () => {
  const donneesReferentiel = {
    fonctionnalites: {
      uneFonctionnalite: {
        description: 'Une fonctionnalité',
      },
    },
    donneesCaracterePersonnel: {
      desDonnees: {
        description: 'Des données',
      },
    },
    delaisAvantImpactCritique: {
      unJour: { description: 'Un jour' },
    },
  };
  const referentiel = Referentiel.creeReferentiel(donneesReferentiel);
  const homologation = new Homologation(
    {
      id: '123',
      idUtilisateur: '456',
      descriptionService: {
        nomService: 'Nom Service',
        fonctionnalites: ['uneFonctionnalite'],
        fonctionnalitesSpecifiques: [
          { description: 'Une fonctionnalité spécifique' },
        ],
        donneesCaracterePersonnel: ['desDonnees'],
        donneesSensiblesSpecifiques: [
          { description: 'Des données spécifiques' },
        ],
        delaiAvantImpactCritique: 'unJour',
      },
    },
    referentiel
  );

  it('fournit le nom du service', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(homologation);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('nomService');
    expect(donnees.nomService).to.equal('Nom Service');
  });

  it('fournit la liste des fonctionnalités', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      homologation,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('fonctionnalites');
    expect(donnees.fonctionnalites[0]).to.equal('Une fonctionnalité');
  });

  it('ajoute à la liste des fonctionnalités les spécifiques', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      homologation,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('fonctionnalites');
    expect(donnees.fonctionnalites).to.contain('Une fonctionnalité spécifique');
  });

  it('fournit la liste des données stockées', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      homologation,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('donneesStockees');
    expect(donnees.donneesStockees[0]).to.equal('Des données');
  });

  it('ajoute les données spécifiques à la liste des données stockées', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      homologation,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('donneesStockees');
    expect(donnees.donneesStockees).to.contain('Des données spécifiques');
  });

  it('fournit la durée maximale acceptable de dysfonctionnement grave', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      homologation,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('dureeDysfonctionnementMaximumAcceptable');
    expect(donnees.dureeDysfonctionnementMaximumAcceptable).to.equal('Un jour');
  });
});
