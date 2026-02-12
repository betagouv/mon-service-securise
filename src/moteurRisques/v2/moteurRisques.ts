import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { SelectionVecteurs } from './selectionVecteurs.js';
import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { SelectionObjectifsVises } from './selectionObjectifsVises.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';

export class MoteurRisquesV2 {
  private readonly selectionVecteurs: Array<IdVecteurRisque>;
  private readonly selectionObjectifsVises: Array<IdObjectifVise>;

  constructor(private readonly descriptionService: DescriptionServiceV2) {
    this.selectionVecteurs = new SelectionVecteurs().selectionnePourService(
      descriptionService
    );
    this.selectionObjectifsVises =
      new SelectionObjectifsVises().selectionnePourService(descriptionService);
  }

  vecteurs(): Array<IdVecteurRisque> {
    return this.selectionVecteurs;
  }

  objectifsVises(): Array<IdObjectifVise> {
    return this.selectionObjectifsVises;
  }
}
