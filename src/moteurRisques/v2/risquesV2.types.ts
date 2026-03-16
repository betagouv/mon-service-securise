import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';

export type ConfigurationRisqueV2 = Record<
  IdVecteurRisque,
  {
    intitule: string;
    intitulesObjectifsVises: Partial<Record<IdObjectifVise, string>>;
  }
>;

export type IdRisqueV2 = `R${
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14}`;

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
