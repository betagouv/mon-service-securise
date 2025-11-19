import uneDescriptionValide from '../constructeurs/constructeurDescriptionService.js';
import { convertisDescriptionV1BrouillonV2 } from '../../src/modeles/convertisseurDescriptionV1BrouillonV2.js';
import { creeReferentiel } from '../../src/referentiel.js';

describe('Le convertisseur de description v1 en brouillon v2', () => {
  it('recopie tel quel le nom de service', () => {
    const descriptionV1 = uneDescriptionValide()
      .avecNomService('Un nom de service')
      .construis();

    const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

    expect(brouillonV2.toJSON().nomService).toBe('Un nom de service');
  });

  it("recopie tel quel l'organisation responsable'", () => {
    const descriptionV1 = uneDescriptionValide()
      .deLOrganisation({ siret: '123456' })
      .construis();

    const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

    expect(brouillonV2.toJSON().siret).toBe('123456');
  });

  describe('concernant les types de service', () => {
    it('conserve API et application mobile', () => {
      const descriptionV1 = uneDescriptionValide()
        .avecTypes(['api', 'applicationMobile'])
        .construis();

      const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

      expect(brouillonV2.toJSON().typeService).toEqual([
        'api',
        'applicationMobile',
      ]);
    });

    it('devient serviceEnLigne pour le type siteInternet avec une gestion de compte', () => {
      const descriptionV1 = uneDescriptionValide()
        .avecTypes(['siteInternet'])
        .avecFonctionnalites(['compte'])
        .construis();

      const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

      expect(brouillonV2.toJSON().typeService).toEqual(['serviceEnLigne']);
    });

    it('devient portailInformation pour le type siteInternet sans gestion de compte', () => {
      const descriptionV1 = uneDescriptionValide()
        .avecTypes(['siteInternet'])
        .avecFonctionnalites([])
        .construis();

      const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

      expect(brouillonV2.toJSON().typeService).toEqual(['portailInformation']);
    });
  });

  it("convertis en SaaS une description avec provenance 'proposé en ligne par un fournisseur'", () => {
    const descriptionV1 = uneDescriptionValide()
      .avecProvenance('achat')
      .construis();

    const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

    expect(brouillonV2.toJSON().typeHebergement).toBe('saas');
    expect(brouillonV2.toJSON().activitesExternalisees).toEqual([
      'administrationTechnique',
      'developpementLogiciel',
    ]);
  });

  it.each([
    { statutV1: 'enProjet', statutV2: 'enProjet' },
    { statutV1: 'enCours', statutV2: 'enCours' },
    { statutV1: 'enLigne', statutV2: 'enLigne' },
  ])('conserve le statut $statutV1 du service V1', ({ statutV1, statutV2 }) => {
    const descriptionV1 = uneDescriptionValide(creeReferentiel(), false)
      .avecStatut(statutV1)
      .avecLocalisation('france')
      .construis();

    const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

    expect(brouillonV2.toJSON().statutDeploiement).toBe(statutV2);
  });

  it('conserve la présentation', () => {
    const descriptionV1 = uneDescriptionValide()
      .avecPresentation('Une présentation')
      .construis();

    const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

    expect(brouillonV2.toJSON().presentation).toBe('Une présentation');
  });

  it("conserve les points d'accès", () => {
    const descriptionV1 = uneDescriptionValide()
      .accessiblePar('url A', 'url B')
      .construis();

    const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

    expect(brouillonV2.toJSON().pointsAcces).toEqual(['url A', 'url B']);
  });

  describe('concernant les fonctionnalites', () => {
    it("convertis la fonctionnalité d'envoi d'email en spécifité du projet", () => {
      const descriptionV1 = uneDescriptionValide()
        .avecFonctionnalites('emails')
        .construis();

      const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

      expect(brouillonV2.toJSON().specificitesProjet).toEqual([
        'echangeOuReceptionEmails',
      ]);
    });

    it('convertis la fonctionnalité de signature électronique en spécifité du projet', () => {
      const descriptionV1 = uneDescriptionValide()
        .avecFonctionnalites('signatureElectronique')
        .construis();

      const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

      expect(brouillonV2.toJSON().specificitesProjet).toEqual([
        'dispositifDeSignatureElectronique',
      ]);
    });
  });

  describe('concernant les données à caractère personnel', () => {
    it.each([
      { donneeV1: 'contact', categorieV2: 'donneesDIdentite' },
      { donneeV1: 'identite', categorieV2: 'donneesDIdentite' },
      { donneeV1: 'document', categorieV2: 'documentsIdentifiants' },
      {
        donneeV1: 'situation',
        categorieV2: 'donneesSituationFamilialeEconomiqueFinanciere',
      },
      { donneeV1: 'banque', categorieV2: 'documentsRHSensibles' },
      {
        donneeV1: 'mineurs',
        categorieV2: 'donneesCaracterePersonnelPersonneARisque',
      },
      { donneeV1: 'sensibiliteParticuliere', categorieV2: 'donneesSensibles' },
      { donneeV1: 'sensibiliteParticuliere', categorieV2: 'donneesSensibles' },
    ])(
      'convertis les données $donneeV1 en $categorieV2',
      ({ donneeV1, categorieV2 }) => {
        const descriptionV1 = uneDescriptionValide()
          .avecDonneesCaracterePersonnel([donneeV1])
          .construis();

        const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

        expect(brouillonV2.toJSON().categoriesDonneesTraitees).toEqual([
          categorieV2,
        ]);
      }
    );
  });

  it.each([
    { localisationV1: 'france', localisationV2: 'UE' },
    { localisationV1: 'unionEuropeenne', localisationV2: 'UE' },
    { localisationV1: 'autre', localisationV2: 'horsUE' },
  ])(
    'convertis la localisation des données',
    ({ localisationV1, localisationV2 }) => {
      const descriptionV1 = uneDescriptionValide(creeReferentiel(), false)
        .avecStatut('enCours')
        .avecLocalisation(localisationV1)
        .construis();

      const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

      expect(brouillonV2.toJSON().localisationDonneesTraitees).toBe(
        localisationV2
      );
    }
  );

  it('convertis le délai avant impact critique en durée maximale de dysfonctionnement', () => {
    const descriptionV1 = uneDescriptionValide()
      .avecDelaiAvantImpactCritique('uneJournee')
      .construis();

    const brouillonV2 = convertisDescriptionV1BrouillonV2(descriptionV1);

    expect(brouillonV2.toJSON().dureeDysfonctionnementAcceptable).toBe(
      'moinsDe24h'
    );
  });
});
