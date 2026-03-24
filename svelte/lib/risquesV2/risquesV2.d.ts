import type {
  ReferentielStatut,
  Referentiel,
  CategorieMesure,
} from '../ui/types';
import type {
  ReferentielGravites,
  ReferentielVraisemblances,
} from '../risques/risques.d';
import type { UUID } from '../typesBasiquesSvelte';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-risques-v2': CustomEvent;
  }
}

type Niveau = 1 | 2 | 3 | 4;

export type Risque = {
  id: string;
  intitule: string;
  categories: string[];
  gravite: Niveau;
  vraisemblance: Niveau;
  desactive?: boolean;
  commentaire?: string;
  mesuresAssociees: string[];
};

export type TousRisques = {
  risquesBruts: Risque[];
  risques: Risque[];
  risquesCibles: Risque[];
  risquesSpecifiques: RisqueSpecifiqueV2[];
};

export type RisquesV2Props = {
  idService: string;
  statuts: ReferentielStatut;
  niveauxGravite: ReferentielGravites;
  niveauxVraisemblance: ReferentielVraisemblances;
};

export type MesureGeneraleAssocieeARisque = {
  description: string;
  statut?: 'aLancer' | 'enCours' | 'fait' | 'nonFait';
  id: string;
  referentiel: Referentiel;
  categorie: CategorieMesure;
  indispensable: boolean;
};

export type MesuresAssocieesARisque = {
  mesuresGenerales: Record<string, MesureGeneraleAssocieeARisque>;
};

export type DonneesRisqueSpecifiqueV2 = {
  intitule: string;
  description?: string;
  categories: string[];
  gravite: Niveau;
  vraisemblance: Niveau;
  graviteBrute: Niveau;
  vraisemblanceBrute: Niveau;
  commentaire?: string;
};

export type RisqueSpecifiqueV2 = DonneesRisqueSpecifiqueV2 & { id: UUID };
