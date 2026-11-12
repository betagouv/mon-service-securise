import { cartographiesDesRisques } from '../../../src/modeles/objetsPowerpoint/cartographiesDesRisques.js';
import { RisquesV2 } from '../../../src/moteurRisques/v2/risquesV2.js';
import { RisqueV2 } from '../../../src/moteurRisques/v2/risqueV2.js';
import { RisqueSpecifiqueV2 } from '../../../src/moteurRisques/v2/risqueSpecifiqueV2.js';
import { unUUID } from '../../constructeurs/UUID.js';
import { Gravite } from '../../../src/moteurRisques/v2/graviteObjectifsVises.js';

describe('Les cartographies des risques présentées à la commission', () => {
  const desRisques = ({
    risques = [],
    risquesBruts = [],
    risquesCibles = [],
    risquesSpecifiques = [],
  }: {
    risques?: RisqueV2[];
    risquesBruts?: RisqueV2[];
    risquesCibles?: RisqueV2[];
    risquesSpecifiques?: RisqueSpecifiqueV2[];
  }) =>
    new RisquesV2({
      risques,
      risquesBruts,
      risquesCibles,
      risquesSpecifiques,
    });

  const unRisqueSpecifique = () =>
    new RisqueSpecifiqueV2({
      id: unUUID('a'),
      identifiantNumerique: 'RS1',
      intitule: 'Fuite des plannings',
      categories: ['confidentialite'],
      risqueBrut: { gravite: 3, vraisemblance: 4 },
      gravite: 2,
      vraisemblance: 1,
    });

  it('placent chaque risque brut avec son identifiant, son intitulé, sa gravité et sa vraisemblance', () => {
    const risqueBrut = new RisqueV2('V3', { OV1: 3 }, 4, [], {});

    const { bruts } = cartographiesDesRisques(
      desRisques({ risquesBruts: [risqueBrut] })
    );

    expect(bruts).toEqual([
      expect.objectContaining({
        identifiant: 'R3',
        intitule: risqueBrut.intitule,
        gravite: 3,
        vraisemblance: 4,
      }),
    ]);
  });

  it('écartent les risques désactivés', () => {
    const { bruts } = cartographiesDesRisques(
      desRisques({
        risquesBruts: [
          new RisqueV2('V3', { OV1: 3 }, 4, [], { desactive: true }),
          new RisqueV2('V4', { OV1: 3 }, 4, [], {}),
        ],
      })
    );

    expect(bruts.map(({ identifiant }) => identifiant)).toEqual(['R4']);
  });

  it.each([
    { gravite: 1, vraisemblance: 2, niveau: 'faible' },
    { gravite: 4, vraisemblance: 1, niveau: 'moyen' },
    { gravite: 2, vraisemblance: 4, niveau: 'eleve' },
  ] as const)(
    'donnent au risque de gravité $gravite et de vraisemblance $vraisemblance le niveau $niveau',
    ({ gravite, vraisemblance, niveau }) => {
      const { bruts } = cartographiesDesRisques(
        desRisques({
          risquesBruts: [
            new RisqueV2('V3', { OV1: gravite }, vraisemblance, [], {}),
          ],
        })
      );

      expect(bruts[0].niveau).toBe(niveau);
    }
  );

  it('ajoutent les risques spécifiques à la fin de la cartographie brute, avec leur évaluation brute', () => {
    const { bruts } = cartographiesDesRisques(
      desRisques({
        risquesBruts: [new RisqueV2('V3', { OV1: 3 }, 4, [], {})],
        risquesSpecifiques: [unRisqueSpecifique()],
      })
    );

    expect(bruts[1]).toEqual({
      identifiant: 'RS1',
      intitule: 'Fuite des plannings',
      description: '',
      gravite: 3,
      vraisemblance: 4,
      niveau: 'eleve',
    });
  });

  it('placent dans la cartographie à date les risques à date, puis les risques spécifiques avec leur évaluation à date', () => {
    const { aDate } = cartographiesDesRisques(
      desRisques({
        risques: [new RisqueV2('V3', { OV1: 3 }, 2, [], {})],
        risquesSpecifiques: [unRisqueSpecifique()],
      })
    );

    expect(
      aDate.map(({ identifiant, gravite, vraisemblance }) => ({
        identifiant,
        gravite,
        vraisemblance,
      }))
    ).toEqual([
      { identifiant: 'R3', gravite: 3, vraisemblance: 2 },
      { identifiant: 'RS1', gravite: 2, vraisemblance: 1 },
    ]);
  });

  it('placent dans la cartographie cible les risques cibles, puis les risques spécifiques avec leur évaluation à date, faute d’évaluation cible', () => {
    const { cibles } = cartographiesDesRisques(
      desRisques({
        risquesCibles: [new RisqueV2('V3', { OV1: 3 }, 1, [], {})],
        risquesSpecifiques: [unRisqueSpecifique()],
      })
    );

    expect(
      cibles.map(({ identifiant, gravite, vraisemblance }) => ({
        identifiant,
        gravite,
        vraisemblance,
      }))
    ).toEqual([
      { identifiant: 'R3', gravite: 3, vraisemblance: 1 },
      { identifiant: 'RS1', gravite: 2, vraisemblance: 1 },
    ]);
  });

  it('ne donnent pas de niveau à un risque spécifique dont la gravité ou la vraisemblance n’est pas renseignée', () => {
    const nonRenseignee = 0 as Gravite;
    const { aDate } = cartographiesDesRisques(
      desRisques({
        risquesSpecifiques: [
          new RisqueSpecifiqueV2({
            id: unUUID('a'),
            identifiantNumerique: 'RS1',
            intitule: 'Fuite des plannings',
            categories: ['confidentialite'],
            risqueBrut: { gravite: 3, vraisemblance: 4 },
            gravite: nonRenseignee,
            vraisemblance: 1,
          }),
        ],
      })
    );

    expect(aDate[0].niveau).toBe('nonEvalue');
  });

  it('donnent la description de chaque risque, général ou spécifique', () => {
    const risqueGeneral = new RisqueV2('V3', { OV1: 3 }, 2, [], {});
    const { aDate } = cartographiesDesRisques(
      desRisques({
        risques: [risqueGeneral],
        risquesSpecifiques: [
          new RisqueSpecifiqueV2({
            id: unUUID('a'),
            identifiantNumerique: 'RS1',
            intitule: 'Fuite des plannings',
            description: 'Les plannings sont diffusés hors de la commune.',
            categories: ['confidentialite'],
            risqueBrut: { gravite: 3, vraisemblance: 4 },
            gravite: 2,
            vraisemblance: 1,
          }),
        ],
      })
    );

    expect(aDate.map(({ description }) => description)).toEqual([
      risqueGeneral.description,
      'Les plannings sont diffusés hors de la commune.',
    ]);
  });
});
