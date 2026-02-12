import { GraviteVecteurs } from '../../../src/moteurRisques/v2/graviteVecteurs.ts';
import { IdVecteurRisque } from '../../../src/moteurRisques/v2/selectionVecteurs.types.ts';
import { IdObjectifVise } from '../../../src/moteurRisques/v2/selectionObjectifsVises.types.ts';
import { Gravite } from '../../../src/moteurRisques/v2/graviteObjectifsVises.ts';

describe('La gravité des Vecteurs', () => {
  const lesGravites = (contenu: Partial<Record<IdObjectifVise, Gravite>>) =>
    contenu;

  const matriceVecteurOV = (
    surcharge?: Partial<Record<IdVecteurRisque, Array<IdObjectifVise>>>
  ) => {
    const tousLesOV: Array<IdObjectifVise> = ['OV1', 'OV2', 'OV3', 'OV4'];
    return {
      V1: tousLesOV,
      V2: tousLesOV,
      V3: tousLesOV,
      V4: tousLesOV,
      V5: tousLesOV,
      V6: tousLesOV,
      V7: tousLesOV,
      V8: tousLesOV,
      V9: tousLesOV,
      V10: tousLesOV,
      V11: tousLesOV,
      V12: tousLesOV,
      V13: tousLesOV,
      V14: tousLesOV,
      ...surcharge,
    };
  };

  it("retient l'OV ayant la gravité maximale, pour un vecteur", () => {
    const g = new GraviteVecteurs(matriceVecteurOV());
    const vecteurs: Array<IdVecteurRisque> = ['V1'];
    const gravites = lesGravites({ OV2: 4, OV3: 2 });

    const resultat = g.calcule(vecteurs, gravites);

    expect(resultat.V1).toEqual({ OV2: 4 });
  });

  it('retient plusieurs OV si la gravité maximale est partagée', () => {
    const g = new GraviteVecteurs(matriceVecteurOV());
    const vecteurs: Array<IdVecteurRisque> = ['V1'];
    const gravites = lesGravites({ OV2: 4, OV3: 4 });

    const resultat = g.calcule(vecteurs, gravites);

    expect(resultat.V1).toEqual({ OV2: 4, OV3: 4 });
  });

  it('calcule pour tous les vecteurs passés', () => {
    const g = new GraviteVecteurs(matriceVecteurOV());
    const vecteurs: Array<IdVecteurRisque> = ['V1', 'V2'];
    const gravites = lesGravites({ OV2: 4, OV3: 1 });

    const resultat = g.calcule(vecteurs, gravites);

    expect(resultat).toEqual({ V1: { OV2: 4 }, V2: { OV2: 4 } });
  });

  it('pour chaque vecteur, ignore les OV qui sont exclus via la configuration', () => {
    const gardeSeulementOv3: Array<IdObjectifVise> = ['OV3'];
    const configuration = matriceVecteurOV({
      V1: ['OV1', 'OV2', 'OV3', 'OV4'],
      V2: gardeSeulementOv3,
    });
    const g = new GraviteVecteurs(configuration);
    const vecteurs: Array<IdVecteurRisque> = ['V1', 'V2'];
    const gravites = lesGravites({ OV2: 4, OV3: 1 });

    const resultat = g.calcule(vecteurs, gravites);

    expect(resultat.V1).toEqual({ OV2: 4 });
    // On veut OV3, car OV2 est exclue par la configuration
    expect(resultat.V2).toEqual({ OV3: 1 });
  });
});
