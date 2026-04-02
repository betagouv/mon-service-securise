import type { EtapeService } from '../menuNavigationService/menuNavigationService.d';
import type { IdCategorie } from '../tableauDesMesures/tableauDesMesures.d';
import type { StatutMesure } from '../modeles/modeleMesure';
import type { ReferentielPriorite } from '../ui/types';
import type { DescriptionServiceV2API } from '../decrireV2/decrireV2.d';

declare global {
  interface HTMLElementEventMap {
    'svelte-recharge-pages-service': CustomEvent;
  }
}

export type ReferentielPagesService = {
  indiceCyber: {
    noteMax: number;
  };
  mesures: {
    categories: Record<IdCategorie, string>;
    statuts: Record<StatutMesure, string>;
    priorites: ReferentielPriorite;
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
  descriptionService: DescriptionServiceV2API;
};
