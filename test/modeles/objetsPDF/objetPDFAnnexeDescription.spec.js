import expect from 'expect.js';
import Service from '../../../src/modeles/service.js';
import * as Referentiel from '../../../src/referentiel.js';
import VueAnnexePDFDescription from '../../../src/modeles/objetsPDF/objetPDFAnnexeDescription.js';

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
  const service = new Service(
    {
      id: '123',
      versionService: 'v1',
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
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.versionService).to.equal('v1');
  });

  it('fournit la version du service', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('nomService');
    expect(donnees.nomService).to.equal('Nom Service');
  });

  it('fournit la liste des fonctionnalités', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('fonctionnalites');
    expect(donnees.fonctionnalites[0]).to.equal('Une fonctionnalité');
  });

  it('ajoute à la liste des fonctionnalités les spécifiques', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('fonctionnalites');
    expect(donnees.fonctionnalites).to.contain('Une fonctionnalité spécifique');
  });

  it('fournit la liste des données stockées', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('donneesStockees');
    expect(donnees.donneesStockees[0]).to.equal('Des données');
  });

  it('ajoute les données spécifiques à la liste des données stockées', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('donneesStockees');
    expect(donnees.donneesStockees).to.contain('Des données spécifiques');
  });

  it('fournit la durée maximale acceptable de dysfonctionnement grave', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).to.have.key('dureeDysfonctionnementMaximumAcceptable');
    expect(donnees.dureeDysfonctionnementMaximumAcceptable).to.equal('Un jour');
  });
});
