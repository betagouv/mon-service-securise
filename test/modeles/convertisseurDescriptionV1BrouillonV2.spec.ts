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
});
