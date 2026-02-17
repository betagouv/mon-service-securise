import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { SelectionVecteurs } from './selectionVecteurs.js';
import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { SelectionObjectifsVises } from './selectionObjectifsVises.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { Gravite, GraviteObjectifsVises } from './graviteObjectifsVises.js';
import { GraviteVecteurs } from './graviteVecteurs.js';
import { RisqueV2 } from './risqueV2.js';

export class MoteurRisquesV2 {
  private readonly selectionVecteurs: Array<IdVecteurRisque>;

  constructor(private readonly descriptionService: DescriptionServiceV2) {
    this.selectionVecteurs = new SelectionVecteurs().selectionnePourService(
      descriptionService
    );
  }

  vecteurs(): Array<IdVecteurRisque> {
    return this.selectionVecteurs;
  }

  objectifsVises(): Partial<Record<IdObjectifVise, Gravite>> {
    const gravites = new GraviteObjectifsVises().calculePourService(
      this.descriptionService
    );
    const OVs = new SelectionObjectifsVises().selectionnePourService(
      this.descriptionService
    );

    return Object.fromEntries(OVs.map((ov) => [ov, gravites[ov]]));
  }

  risques(): RisqueV2[] {
    const gravitesParVecteur = new GraviteVecteurs().calcule(
      this.vecteurs(),
      this.objectifsVises()
    );

    return Object.entries(gravitesParVecteur).map(
      ([id, ovs]) => new RisqueV2(id as IdVecteurRisque, ovs, 1)
    );
  }
}
