import Service from '../../../src/modeles/service.js';
import { creeReferentiel } from '../../../src/referentiel.js';
import VueAnnexePDFDescription, {
  ServiceV1,
} from '../../../src/modeles/objetsPDF/objetPDFAnnexeDescription.js';
import { donneesReferentielDeTest } from '../../constructeurs/referentielDeTest.ts';

describe("L'objet PDF de l'annexe de description", () => {
  const donneesReferentiel = donneesReferentielDeTest({
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
  });
  const referentiel = creeReferentiel(donneesReferentiel);
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
  ) as ServiceV1;

  it('fournit le nom du service', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.versionService).toEqual('v1');
  });

  it('fournit la version du service', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).toHaveProperty('nomService');
    expect(donnees.nomService).toEqual('Nom Service');
  });

  it('fournit la liste des fonctionnalités', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).toHaveProperty('fonctionnalites');
    expect(donnees.fonctionnalites[0]).toEqual('Une fonctionnalité');
  });

  it('ajoute à la liste des fonctionnalités les spécifiques', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).toHaveProperty('fonctionnalites');
    expect(donnees.fonctionnalites).toContain('Une fonctionnalité spécifique');
  });

  it('fournit la liste des données stockées', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).toHaveProperty('donneesStockees');
    expect(donnees.donneesStockees[0]).toEqual('Des données');
  });

  it('ajoute les données spécifiques à la liste des données stockées', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).toHaveProperty('donneesStockees');
    expect(donnees.donneesStockees).toContain('Des données spécifiques');
  });

  it('fournit la durée maximale acceptable de dysfonctionnement grave', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees).toHaveProperty('dureeDysfonctionnementMaximumAcceptable');
    expect(donnees.dureeDysfonctionnementMaximumAcceptable).toEqual('Un jour');
  });
});
