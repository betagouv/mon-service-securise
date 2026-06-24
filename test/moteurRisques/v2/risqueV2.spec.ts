import { RisqueV2 } from '../../../src/moteurRisques/v2/risqueV2.ts';
import { ConfigurationRisqueV2 } from '../../../src/moteurRisques/v2/risquesV2.types.ts';

describe('Un risque V2', () => {
  const intitulesOVs = () => ({
    OV1: 'avec OV1',
    OV2: 'avec OV2',
    OV3: 'avec OV3',
    OV4: 'avec OV4',
  });

  const detailsVecteur = (intitule: string) => ({
    intitule,
    description: `Description ${intitule}`,
    exemple: `Exemple ${intitule}`,
    intitulesObjectifsVises: intitulesOVs(),
  });

  const configurationRisque = (
    surchargeVecteur?: Partial<ConfigurationRisqueV2>
  ): ConfigurationRisqueV2 => ({
    V1: detailsVecteur('V1'),
    V2: detailsVecteur('V2'),
    V3: detailsVecteur('V3'),
    V4: detailsVecteur('V4'),
    V5: detailsVecteur('V5'),
    V6: detailsVecteur('V6'),
    V7: detailsVecteur('V7'),
    V8: detailsVecteur('V8'),
    V9: detailsVecteur('V9'),
    V10: detailsVecteur('V10'),
    V11: detailsVecteur('V11'),
    V12: detailsVecteur('V12'),
    V13: detailsVecteur('V13'),
    V14: detailsVecteur('V14'),
    ...surchargeVecteur,
  });

  it('connaît son identifiant qui est fonction de son vecteur', () => {
    const r1 = new RisqueV2('V1', { OV1: 3 }, 1, [], {}, configurationRisque());

    expect(r1.id).toBe('R1');
  });

  describe('concernant sa gravité', () => {
    it('connait son niveau de gravité', () => {
      const risque = new RisqueV2(
        'V1',
        { OV1: 3 },
        1,
        [],
        {},
        configurationRisque()
      );

      expect(risque.gravite).toBe(3);
    });

    it("retourne la gravité maximale de tous les OV (même s'il devrait tous avoir la même valeur)", () => {
      const risque = new RisqueV2(
        'V1',
        { OV2: 3, OV3: 3 },
        1,
        [],
        {},
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
      [],
      {},
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
          description: 'Description V1',
          exemple: 'Exemple V1',
        },
      };

      const risque = new RisqueV2(
        'V1',
        { OV1: 3 },
        1,
        [],
        {},
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
          description: 'Description V1',
          exemple: 'Exemple V1',
        },
      };

      const risque = new RisqueV2(
        'V1',
        { OV1: 3, OV2: 3, OV3: 3 },
        1,
        [],
        {},
        configurationRisque(configurationV1)
      );

      expect(risque.intitule).toBe(
        "Intitulé du risque V1 avec l'OV1, avec l'OV2 et avec l'OV3"
      );
    });
  });

  it('connaît sa description', () => {
    const configurationV1 = {
      V1: detailsVecteur('V1'),
    };

    const risque = new RisqueV2(
      'V1',
      { OV1: 3 },
      1,
      [],
      {},
      configurationRisque(configurationV1)
    );

    expect(risque.description).toBe('Description V1');
  });

  it('connaît son exemple', () => {
    const configurationV1 = {
      V1: detailsVecteur('V1'),
    };

    const risque = new RisqueV2(
      'V1',
      { OV1: 3 },
      1,
      [],
      {},
      configurationRisque(configurationV1)
    );

    expect(risque.exemple).toBe('Exemple V1');
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
        const r1 = new RisqueV2(
          'V1',
          { [ov]: 3 },
          1,
          [],
          {},
          configurationRisque()
        );

        expect(r1.categories).toEqual(categories);
      }
    );

    it('sait combiner les OV sans dupliquer les catégories', () => {
      const r1 = new RisqueV2(
        'V1',
        { OV2: 3, OV4: 1 },
        1,
        [],
        {},
        configurationRisque()
      );

      expect(r1.categories).toEqual(['confidentialite', 'integrite']);
    });
  });

  it('peut se sérialiser en JSON', () => {
    const r1 = new RisqueV2(
      'V1',
      { OV1: 3 },
      1,
      ['RECENSEMENT.1'],
      {},
      configurationRisque()
    );

    expect(r1.toJSON()).toEqual({
      id: 'R1',
      intitule: 'V1 avec OV1',
      description: 'Description V1',
      exemple: 'Exemple V1',
      categories: ['integrite'],
      gravite: 3,
      graviteCalculee: 3,
      vraisemblance: 1,
      mesuresAssociees: ['RECENSEMENT.1'],
    });
  });

  describe('concernant ses données hydratées', () => {
    it('peut être désactivé', () => {
      const risque = new RisqueV2(
        'V1',
        { OV1: 3 },
        1,
        [],
        { desactive: true },
        configurationRisque()
      );

      expect(risque.toJSON().desactive).toBe(true);
    });

    it('peut avoir un commentaire', () => {
      const risque = new RisqueV2(
        'V1',
        { OV1: 3 },
        1,
        [],
        { commentaire: 'intelligent' },
        configurationRisque()
      );

      expect(risque.toJSON().commentaire).toBe('intelligent');
    });

    it('peut surcharger sa gravité', () => {
      const risque = new RisqueV2(
        'V1',
        { OV1: 3 },
        1,
        [],
        { graviteSurchargee: 4 },
        configurationRisque()
      );

      expect(risque.toJSON().gravite).toBe(4);
    });
  });

  describe('concernant ses données sérialisées', () => {
    it("sérialise le commentaire et l'état 'désactivé'", () => {
      const risque = new RisqueV2(
        'V1',
        { OV1: 3 },
        1,
        [],
        { desactive: true, commentaire: 'un commentaire' },
        configurationRisque()
      );

      expect(risque.donneesSerialisees()).toEqual({
        desactive: true,
        commentaire: 'un commentaire',
      });
    });

    it('sérialise la gravité si elle a été surchargée', () => {
      const risque = new RisqueV2(
        'V1',
        { OV1: 3 },
        1,
        [],
        { graviteSurchargee: 4 },
        configurationRisque()
      );

      expect(risque.donneesSerialisees()).toEqual({
        graviteSurchargee: 4,
      });
    });
  });

  it('peut mettre à jour ses données', () => {
    const risque = new RisqueV2(
      'V1',
      { OV1: 3 },
      1,
      [],
      {},
      configurationRisque()
    );

    risque.metsAJour({
      commentaire: 'un commentaire',
      desactive: true,
      graviteSurchargee: 4,
    });

    expect(risque.donneesSerialisees()).toEqual({
      commentaire: 'un commentaire',
      desactive: true,
      graviteSurchargee: 4,
    });
    expect(risque.gravite).toBe(4);
  });
});
