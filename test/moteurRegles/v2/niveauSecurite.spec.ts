import {
  criticiteDisponibiliteEtAudienceCible,
  criticiteVolumetrieDonneesTraitees,
  niveauExposition,
  niveauSecuriteRequis,
} from '../../../src/moteurRegles/v2/niveauSecurite.js';
import { DonneesDescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2.js';

describe('Le moteur de règles de choix de niveau de sécurité V2', () => {
  describe('sur demande de la criticité induite par des données traitées et leur volumétrie', () => {
    it('donne la criticité pour une catégorie unique', () => {
      const criticite = criticiteVolumetrieDonneesTraitees(
        'eleve',
        ['documentsIdentifiants'],
        []
      );

      expect(criticite).toBe(3);
    });

    it('donne la criticité maximale pour plusieurs catégories', () => {
      const criticite = criticiteVolumetrieDonneesTraitees(
        'eleve',
        ['documentsIdentifiants', 'secretsDEntreprise'],
        []
      );

      expect(criticite).toBe(4);
    });

    it('donne la criticité pour des données ajoutées', () => {
      const criticite = criticiteVolumetrieDonneesTraitees(
        'eleve',
        [],
        ['donneeAjoutee', 'autreDonneeAjoutee']
      );

      expect(criticite).toBe(1);
    });

    it('donne la criticité maximale pour plusieurs catégories et plusieurs données ajoutées', () => {
      const criticite = criticiteVolumetrieDonneesTraitees(
        'eleve',
        ['documentsIdentifiants', 'secretsDEntreprise'],
        ['donneeAjoutee', 'autreDonneeAjoutee']
      );

      expect(criticite).toBe(4);
    });

    it('donne une criticité minimale sans aucune donnée renseignée', () => {
      const criticite = criticiteVolumetrieDonneesTraitees('eleve', [], []);

      expect(criticite).toBe(1);
    });
  });

  describe("sur demande de la criticité induite par l'audience cible du service et la disponibilité du service", () => {
    it('retourne le niveau calculé', () => {
      const criticite = criticiteDisponibiliteEtAudienceCible(
        'moinsDe4h',
        'large'
      );

      expect(criticite).toBe(4);
    });
  });

  describe("sur demande de l'exposition à la menace", () => {
    it("retourne le niveau d'exposition à la menace systèmique", () => {
      const niveau = niveauExposition('accessibleSurInternet');

      expect(niveau).toBe(3);
    });
  });

  describe('sur demande du niveau de sécurité requis', () => {
    it('retourne le niveau calculé', () => {
      const besoinsSecurite = niveauSecuriteRequis(
        'eleve',
        ['documentsIdentifiants', 'secretsDEntreprise'],
        ['donneeAjoutee', 'autreDonneeAjoutee'],
        'moinsDe4h',
        'large',
        'accessibleSurInternet'
      );

      expect(besoinsSecurite).toBe('niveau3');
    });
  });

  describe.each([
    {
      nomCasTest: 'S.I. 1',
      niveauRequis: 'niveau2',
      descriptionService: {
        volumetrieDonneesTraitees: 'eleve',
        categoriesDonneesTraitees: ['donneesDIdentite'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'plusDe24h',
        audienceCible: 'large',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 2',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'eleve',
        categoriesDonneesTraitees: [
          'donneesSituationFamilialeEconomiqueFinanciere',
        ],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'large',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 3',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'tresEleve',
        categoriesDonneesTraitees: ['donneesSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe4h',
        audienceCible: 'tresLarge',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 4',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'eleve',
        categoriesDonneesTraitees: ['documentsIdentifiants'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'limitee',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 5',
      niveauRequis: 'niveau2',
      descriptionService: {
        volumetrieDonneesTraitees: 'eleve',
        categoriesDonneesTraitees: ['documentsIdentifiants'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'limitee',
        ouvertureSysteme: 'interne',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 6',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'moyen',
        categoriesDonneesTraitees: ['donneesSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe4h',
        audienceCible: 'moyenne',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 7',
      niveauRequis: 'niveau2',
      descriptionService: {
        volumetrieDonneesTraitees: 'eleve',
        categoriesDonneesTraitees: ['donneesDIdentite'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'limitee',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 8',
      niveauRequis: 'niveau1',
      descriptionService: {
        volumetrieDonneesTraitees: 'tresEleve',
        categoriesDonneesTraitees: [],
        categoriesDonneesTraiteesSupplementaires: ['autre'],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'tresLarge',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 9',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'tresEleve',
        categoriesDonneesTraitees: ['donneesSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'tresLarge',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 10',
      niveauRequis: 'niveau1',
      descriptionService: {
        volumetrieDonneesTraitees: 'moyen',
        categoriesDonneesTraitees: [],
        categoriesDonneesTraiteesSupplementaires: ['autre'],
        dureeDysfonctionnementAcceptable: 'plusDe24h',
        audienceCible: 'moyenne',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 11',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'eleve',
        categoriesDonneesTraitees: ['documentsRHSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'large',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 12',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'faible',
        categoriesDonneesTraitees: ['documentsRHSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe4h',
        audienceCible: 'large',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 13',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'moyen',
        categoriesDonneesTraitees: ['documentsRHSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'large',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 14',
      niveauRequis: 'niveau1',
      descriptionService: {
        volumetrieDonneesTraitees: 'moyen',
        categoriesDonneesTraitees: ['donneesDIdentite'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'plusDe24h',
        audienceCible: 'large',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 15',
      niveauRequis: 'niveau1',
      descriptionService: {
        volumetrieDonneesTraitees: 'faible',
        categoriesDonneesTraitees: ['donneesAdministrativesEtFinancieres'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'limitee',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 16',
      niveauRequis: 'niveau1',
      descriptionService: {
        volumetrieDonneesTraitees: 'faible',
        categoriesDonneesTraitees: ['donneesDIdentite'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'plusDe24h',
        audienceCible: 'limitee',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 17',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'eleve',
        categoriesDonneesTraitees: ['donneesSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'plusDe24h',
        audienceCible: 'limitee',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 18',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'moyen',
        categoriesDonneesTraitees: ['donneesSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe24h',
        audienceCible: 'moyenne',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 19',
      niveauRequis: 'niveau3',
      descriptionService: {
        volumetrieDonneesTraitees: 'eleve',
        categoriesDonneesTraitees: ['donneesSensibles'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe12h',
        audienceCible: 'tresLarge',
        ouvertureSysteme: 'accessibleSurInternet',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 20',
      niveauRequis: 'niveau2',
      descriptionService: {
        volumetrieDonneesTraitees: 'faible',
        categoriesDonneesTraitees: [
          'donneesSituationFamilialeEconomiqueFinanciere',
        ],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe12h',
        audienceCible: 'large',
        ouvertureSysteme: 'interne',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 21',
      niveauRequis: 'niveau1',
      descriptionService: {
        volumetrieDonneesTraitees: 'faible',
        categoriesDonneesTraitees: ['secretsDEntreprise'],
        categoriesDonneesTraiteesSupplementaires: [],
        dureeDysfonctionnementAcceptable: 'moinsDe12h',
        audienceCible: 'limitee',
        ouvertureSysteme: 'interne',
      } as Partial<DonneesDescriptionServiceV2>,
    },
    {
      nomCasTest: 'S.I. 22',
      niveauRequis: 'niveau1',
      descriptionService: {
        volumetrieDonneesTraitees: 'tresEleve',
        categoriesDonneesTraitees: [],
        categoriesDonneesTraiteesSupplementaires: ['autresDonnees'],
        dureeDysfonctionnementAcceptable: 'plusDe24h',
        audienceCible: 'limitee',
        ouvertureSysteme: 'interne',
      } as Partial<DonneesDescriptionServiceV2>,
    },
  ])(
    `évalue le niveau de sécurité requis pour les besoins de $nomCasTest`,
    ({ descriptionService: d, niveauRequis }) => {
      const niveauRecommande = niveauSecuriteRequis(
        d.volumetrieDonneesTraitees!,
        d.categoriesDonneesTraitees!,
        d.categoriesDonneesTraiteesSupplementaires!,
        d.dureeDysfonctionnementAcceptable!,
        d.audienceCible!,
        d.ouvertureSysteme!
      );

      expect(niveauRecommande).toBe(niveauRequis);
    }
  );
});
