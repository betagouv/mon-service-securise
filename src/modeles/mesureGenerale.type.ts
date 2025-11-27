import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';
import { IdMesureV2 } from '../../donneesReferentielMesuresV2.js';

export type DonneesMesureGenerale<TVersion extends IdMesureV1 | IdMesureV2> = {
  id: TVersion;
  statut: string;
  modalites?: string;
  priorite?: string;
  echeance?: string;
  responsables: string[];
};
