import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { Gravite } from './graviteObjectifsVises.js';

export class RisqueV2 {
  gravite: Gravite;

  constructor(
    private readonly idVecteur: IdVecteurRisque,
    private readonly objectifsVises: Partial<Record<IdObjectifVise, Gravite>>
  ) {
    this.gravite = Math.max(...Object.values(objectifsVises)) as Gravite;
  }
}
