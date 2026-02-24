import {
  ConfigurationRisqueV2,
  RisqueV2,
} from '../../../src/moteurRisques/v2/risqueV2.ts';

describe('Un risque V2', () => {
  const intitulesOVs = () => ({
    OV1: 'avec OV1',
    OV2: 'avec OV2',
    OV3: 'avec OV3',
    OV4: 'avec OV4',
  });

  const configurationRisque = (
    surchargeVecteur?: Partial<ConfigurationRisqueV2>
  ): ConfigurationRisqueV2 => ({
    V1: { intitule: 'V1', intitulesObjectifsVises: intitulesOVs() },
    V2: { intitule: 'V2', intitulesObjectifsVises: intitulesOVs() },
    V3: { intitule: 'V3', intitulesObjectifsVises: intitulesOVs() },
    V4: { intitule: 'V4', intitulesObjectifsVises: intitulesOVs() },
    V5: { intitule: 'V5', intitulesObjectifsVises: intitulesOVs() },
    V6: { intitule: 'V6', intitulesObjectifsVises: intitulesOVs() },
    V7: { intitule: 'V7', intitulesObjectifsVises: intitulesOVs() },
    V8: { intitule: 'V8', intitulesObjectifsVises: intitulesOVs() },
    V9: { intitule: 'V9', intitulesObjectifsVises: intitulesOVs() },
    V10: { intitule: 'V10', intitulesObjectifsVises: intitulesOVs() },
    V11: { intitule: 'V11', intitulesObjectifsVises: intitulesOVs() },
    V12: { intitule: 'V12', intitulesObjectifsVises: intitulesOVs() },
    V13: { intitule: 'V13', intitulesObjectifsVises: intitulesOVs() },
    V14: { intitule: 'V14', intitulesObjectifsVises: intitulesOVs() },
    ...surchargeVecteur,
  });

  it('connaît son identifiant qui est fonction de son vecteur', () => {
    const r1 = new RisqueV2('V1', { OV1: 3 }, 1, configurationRisque());

    expect(r1.id).toBe('R1');
  });

  describe('concernant sa gravité', () => {
    it('connait son niveau de gravité', () => {
      const risque = new RisqueV2('V1', { OV1: 3 }, 1, configurationRisque());

      expect(risque.gravite).toBe(3);
    });

    it("retourne la gravité maximale de tous les OV (même s'il devrait tous avoir la même valeur)", () => {
      const risque = new RisqueV2(
        'V1',
        { OV2: 3, OV3: 3 },
        1,
        configurationRisque()
      );

      expect(risque.gravite).toBe(3);
    });
  });

  it('connaît sa vraisemblance', () => {
    const tresVraisemblable = 3;
    const risque = new RisqueV2(
      'V1',
      { OV1: 3 },
      tresVraisemblable,
      configurationRisque()
    );

    expect(risque.vraisemblance).toBe(3);
  });

  describe('concernant son intitulé', () => {
    it("joins l'intitulé du vecteur et de l'objectif visé", () => {
      const configurationV1 = {
        V1: {
          intitule: 'Intitulé du risque V1',
          intitulesObjectifsVises: { OV1: "avec l'OV1" },
        },
      };

      const risque = new RisqueV2(
        'V1',
        { OV1: 3 },
        1,
        configurationRisque(configurationV1)
      );

      expect(risque.intitule).toBe("Intitulé du risque V1 avec l'OV1");
    });

    it('joins les intitulés de tous les objectifs visés avec un connecteur de conjonction', () => {
      const configurationV1 = {
        V1: {
          intitule: 'Intitulé du risque V1',
          intitulesObjectifsVises: {
            OV1: "avec l'OV1",
            OV2: "avec l'OV2",
            OV3: "avec l'OV3",
          },
        },
      };

      const risque = new RisqueV2(
        'V1',
        { OV1: 3, OV2: 3, OV3: 3 },
        1,
        configurationRisque(configurationV1)
      );

      expect(risque.intitule).toBe(
        "Intitulé du risque V1 avec l'OV1, avec l'OV2 et avec l'OV3"
      );
    });
  });

  describe('concernant ses catégories', () => {
    it.each([
      { ov: 'OV1', categories: ['integrite'] },
      { ov: 'OV2', categories: ['confidentialite', 'integrite'] },
      { ov: 'OV3', categories: ['disponibilite'] },
      { ov: 'OV4', categories: ['integrite'] },
    ])(
      'connaît ses catégories qui sont fonction de ses OV: $ov donne $categories',
      ({ ov, categories }) => {
        const r1 = new RisqueV2('V1', { [ov]: 3 }, 1, configurationRisque());

        expect(r1.categories).toEqual(categories);
      }
    );

    it('sait combiner les OV sans dupliquer les catégories', () => {
      const r1 = new RisqueV2(
        'V1',
        { OV2: 3, OV4: 1 },
        1,
        configurationRisque()
      );

      expect(r1.categories).toEqual(['confidentialite', 'integrite']);
    });
  });
});
