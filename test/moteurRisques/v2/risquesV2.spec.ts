import { RisquesV2 } from '../../../src/moteurRisques/v2/risquesV2.ts';
import { RisqueV2 } from '../../../src/moteurRisques/v2/risqueV2.ts';
import { RisqueSpecifiqueV2 } from '../../../src/moteurRisques/v2/risqueSpecifiqueV2.ts';

describe('Les risques V2', () => {
  it('peuvent se sérialiser en JSON', () => {
    const risquesBruts = [new RisqueV2('V3', { OV1: 3 }, 4, [], {})];
    const risques = [new RisqueV2('V3', { OV1: 3 }, 3, [], {})];
    const risquesCibles = [new RisqueV2('V3', { OV1: 3 }, 1, [], {})];
    const risquesSpecifiques = [
      new RisqueSpecifiqueV2({
        categories: ['confidentialite'],
        gravite: 2,
        vraisemblance: 1,
        intitule: 'un risque',
        risqueBrut: { vraisemblance: 1, gravite: 1 },
      }),
    ];

    const tousLesRisques = new RisquesV2({
      risques,
      risquesBruts,
      risquesCibles,
      risquesSpecifiques,
    }).toJSON();

    expect(tousLesRisques.risquesBruts[0].id).toBe('R3');
    expect(tousLesRisques.risquesBruts[0].vraisemblance).toBe(4);

    expect(tousLesRisques.risques[0].id).toBe('R3');
    expect(tousLesRisques.risques[0].vraisemblance).toBe(3);

    expect(tousLesRisques.risquesCibles[0].id).toBe('R3');
    expect(tousLesRisques.risquesCibles[0].vraisemblance).toBe(1);

    expect(tousLesRisques.risquesSpecifiques[0].intitule).toBe('un risque');
    expect(tousLesRisques.risquesSpecifiques[0].vraisemblance).toBe(1);
  });

  it("peut mettre à jour les données d'un risque", () => {
    const tousLesRisques = new RisquesV2({
      risques: [new RisqueV2('V3', { OV1: 3 }, 4, [], {})],
      risquesBruts: [],
      risquesCibles: [],
      risquesSpecifiques: [],
    });

    tousLesRisques.metsAJour('R3', {
      commentaire: 'un commentaire',
      desactive: true,
    });

    expect(tousLesRisques.toJSON().risques[0].commentaire).toBe(
      'un commentaire'
    );
    expect(tousLesRisques.toJSON().risques[0].desactive).toBe(true);
  });
});
