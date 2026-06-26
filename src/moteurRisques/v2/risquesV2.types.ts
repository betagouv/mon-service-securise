import { IdVecteurRisque } from './selectionVecteurs.types.js';
import { IdObjectifVise } from './selectionObjectifsVises.types.js';
import { idsRisquesV2 } from '../../../donneesReferentielRisquesV2.js';
import { ModificationManuelleRisqueV2 } from './risqueV2.js';

export type ConfigurationRisqueV2 = Record<
  IdVecteurRisque,
  {
    intitule: string;
    description: string;
    exemple: string;
    intitulesObjectifsVises: Partial<Record<IdObjectifVise, string>>;
  }
>;

export type IdRisqueV2 = (typeof idsRisquesV2)[number];

export type CategorieRisque =
  | 'disponibilite'
  | 'integrite'
  | 'confidentialite'
  | 'tracabilite';

export type DonneesRisquesV2 = Partial<
  Record<IdRisqueV2, ModificationManuelleRisqueV2>
>;
