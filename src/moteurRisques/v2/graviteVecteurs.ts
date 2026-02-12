/* eslint-disable no-empty-function */
import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { Gravite } from './graviteObjectifsVises.js';

export class GraviteVecteurs {
  constructor(
    private readonly matriceVecteurOV: Record<
      IdVecteurRisque,
      Array<IdObjectifVise>
    >
  ) {}

  calcule(
    vecteurs: Array<IdVecteurRisque>,
    gravitesOV: Partial<Record<IdObjectifVise, Gravite>>
  ) {
    return Object.fromEntries(
      vecteurs.map((vecteur) => {
        const gravitesUtiles = Object.fromEntries(
          this.matriceVecteurOV[vecteur] // On prend la configuration du vecteur courant
            .filter((idOv) => gravitesOV[idOv]) // … on retient seulement les gravités actives
            .map((idOV) => [idOV, gravitesOV[idOV]]) // ... et on reconstitue le couple { ID: gravite }
        ) as Partial<Record<IdObjectifVise, Gravite>>;

        const max = Math.max(...Object.values(gravitesUtiles));

        const OVMax = Object.fromEntries(
          Object.entries(gravitesUtiles).filter(
            ([, gravite]) => gravite === max
          )
        );

        return [vecteur, OVMax];
      })
    );
  }
}
