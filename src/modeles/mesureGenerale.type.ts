import { IdMesureV1 } from '../../donneesConversionReferentielMesures.js';

export type DonneesMesureGenerale = {
  id: IdMesureV1;
  statut: string;
  modalites?: string;
  priorite?: string;
  echeance?: string;
  reponsables: string[];
};
