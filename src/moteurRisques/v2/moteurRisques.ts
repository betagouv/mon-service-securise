import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { SelectionVecteurs } from './selectionVecteurs.js';
import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { SelectionObjectifsVises } from './selectionObjectifsVises.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { Gravite, GraviteObjectifsVises } from './graviteObjectifsVises.js';

export class MoteurRisquesV2 {
  private readonly selectionVecteurs: Array<IdVecteurRisque>;
  private readonly selectionObjectifsVises: Array<IdObjectifVise>;
  private readonly graviteObjectifsVises: Record<IdObjectifVise, Gravite>;

  constructor(private readonly descriptionService: DescriptionServiceV2) {
    this.selectionVecteurs = new SelectionVecteurs().selectionnePourService(
      descriptionService
    );
    this.selectionObjectifsVises =
      new SelectionObjectifsVises().selectionnePourService(descriptionService);
    this.graviteObjectifsVises = new GraviteObjectifsVises().calculePourService(
      descriptionService
    );
  }

  vecteurs(): Array<IdVecteurRisque> {
    return this.selectionVecteurs;
  }

  objectifsVises(): Partial<Record<IdObjectifVise, Gravite>> {
    return Object.fromEntries(
      this.selectionObjectifsVises.map((ov) => [
        ov,
        this.graviteObjectifsVises[ov],
      ])
    );
  }
}
