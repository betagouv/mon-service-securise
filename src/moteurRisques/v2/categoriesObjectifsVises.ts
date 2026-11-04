import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { CategorieRisque } from './risquesV2.types.js';

export const categoriesObjectifsVises: Record<
  IdObjectifVise,
  CategorieRisque[]
> = {
  OV1: ['integrite'],
  OV2: ['confidentialite', 'integrite'],
  OV3: ['disponibilite'],
  OV4: ['integrite'],
};
