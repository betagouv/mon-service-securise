import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { idsRisquesV2 } from '../../../donneesReferentielRisquesV2.js';

export type ConfigurationRisqueV2 = Record<
  IdVecteurRisque,
  {
    intitule: string;
    intitulesObjectifsVises: Partial<Record<IdObjectifVise, string>>;
  }
>;

export type IdRisqueV2 = (typeof idsRisquesV2)[number];

export type CategorieRisque =
  | 'disponibilite'
  | 'integrite'
  | 'confidentialite'
  | 'tracabilite';

export type DonneesRisqueV2 = {
  desactive?: boolean;
  commentaire?: string;
};

export type DonneesRisquesV2 = Partial<Record<IdRisqueV2, DonneesRisqueV2>>;
