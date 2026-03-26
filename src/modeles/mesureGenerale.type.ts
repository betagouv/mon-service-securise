import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';
import { IdStatutMesure } from '../referentiel.types.js';

export type DonneesMesureGenerale<TVersion extends IdMesureV1 | IdMesureV2> = {
  id: TVersion;
  statut: IdStatutMesure;
  modalites?: string;
  priorite?: string;
  echeance?: string;
  rendueIndispensable?: boolean;
  responsables: string[];
};
