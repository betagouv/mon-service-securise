import Service from '../../../src/modeles/service.js';
import * as Referentiel from '../../../src/referentiel.js';
import VueAnnexePDFDescription from '../../../src/modeles/objetsPDF/objetPDFAnnexeDescription.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';
import { ReferentielV2 } from '../../../src/referentielV2.js';

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

    expect(Object.keys(donnees)).toContain('nomService');
    expect(donnees.nomService).toEqual('Nom Service');
  });

  it('fournit la liste des fonctionnalités', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(Object.keys(donnees)).toContain('fonctionnalites');
    expect(donnees.fonctionnalites[0]).toEqual('Une fonctionnalité');
  });

  it('ajoute à la liste des fonctionnalités les spécifiques', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(Object.keys(donnees)).toContain('fonctionnalites');
    expect(donnees.fonctionnalites).toContain('Une fonctionnalité spécifique');
  });

  it('fournit la liste des données stockées', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(Object.keys(donnees)).toContain('donneesStockees');
    expect(donnees.donneesStockees[0]).toEqual('Des données');
  });

  it('ajoute les données spécifiques à la liste des données stockées', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(Object.keys(donnees)).toContain('donneesStockees');
    expect(donnees.donneesStockees).toContain('Des données spécifiques');
  });

  it('fournit la durée maximale acceptable de dysfonctionnement grave', () => {
    const vueAnnexePDFDescription = new VueAnnexePDFDescription(
      service,
      referentiel
    );

    const donnees = vueAnnexePDFDescription.donnees();

    expect(Object.keys(donnees)).toContain(
      'dureeDysfonctionnementMaximumAcceptable'
    );
    expect(donnees.dureeDysfonctionnementMaximumAcceptable).toEqual('Un jour');
  });

  describe('pour un service V2', () => {
    const serviceV2 = new Service(
      {
        id: '123',
        versionService: 'v2',
        descriptionService: uneDescriptionV2Valide()
          .avecSpecificitesProjet(['annuaire', 'postesDeTravail'])
          .donneesDescription(),
      },
      referentiel
    );
    const referentielV2 = new ReferentielV2();

    it('utilise les spécificités du projet à la place des fonctionnalités', () => {
      const vueAnnexePDFDescription = new VueAnnexePDFDescription(
        serviceV2,
        referentielV2
      );

      const donnees = vueAnnexePDFDescription.donnees();

      expect(Object.keys(donnees)).toContain('fonctionnalites');
      expect(donnees.fonctionnalites).toEqual([
        'Un annuaire',
        'Des postes de travail',
      ]);
    });
  });
});
