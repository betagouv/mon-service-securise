import type { EtapeService } from '../menuNavigationService/menuNavigationService.d';
import type { IdCategorie } from '../tableauDesMesures/tableauDesMesures.d';
import type { StatutMesure } from '../modeles/modeleMesure';
import type { ReferentielPriorite } from '../ui/types';
import type {
  MatriceNiveauxRisque,
  NiveauGravite,
  ReferentielCategories,
  ReferentielNiveauxRisque,
  ReferentielRisques,
  ReferentielVraisemblances,
} from '../risques/risques.d';
import type { EtapeParcoursHomologation } from './pages/parcoursHomologation/parcoursHomologation.types';
import type { VersionService } from '../../../src/modeles/versionService';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-pages-service': CustomEvent;
  }
}

export type StatutsAvisDossierHomologation = Record<
  string,
  { description: string }
>;

type EcheancesRenouvellementHomologation = Record<
  string,
  { description: string }
>;

export type ReferentielPagesService = {
  indiceCyber: { noteMax: number };
  mesures: {
    categories: Record<IdCategorie, string>;
    statuts: Record<StatutMesure, string>;
    priorites: ReferentielPriorite;
  };
  risques: {
    categories: ReferentielCategories;
    gravites: Record<string, NiveauGravite>;
    vraisemblances: ReferentielVraisemblances;
    descriptions: ReferentielRisques;
    matrice: MatriceNiveauxRisque;
    niveaux: ReferentielNiveauxRisque;
  };
  dossiers: {
    statutsHomologation: Record<string, { libelle: string }>;
    etapesParcoursHomologation: Array<EtapeParcoursHomologation>;
    statutsAvisDossierHomologation: StatutsAvisDossierHomologation;
    echeancesRenouvellement: EcheancesRenouvellementHomologation;
  };
};

export type PagesServiceProps = {
  idService: string;
  referentiel: ReferentielPagesService;
  visible: Record<EtapeService, boolean>;
  estLectureSeule: Record<EtapeService, boolean>;
  modeVisiteGuidee: boolean;
  etapeActive: EtapeService;
  featureFlags: {
    avecRisquesV2: boolean;
  };
  preferencesUtilisateur: {
    afficheExplicationRisquesV2: boolean;
  };
  suggestionsService: {
    finalisationDescriptionServiceImporte: boolean;
  };
  peutHomologuer: boolean;
};

export type ServicePourPagesService = {
  id: string;
  nomService: string;
  organisationResponsable: string;
  version: VersionService;
  documentsPdfDisponibles: string[];
};
