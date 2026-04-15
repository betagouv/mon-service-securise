import { derived, get, writable } from 'svelte/store';
import type { EtapeService } from '../../menuNavigationService/menuNavigationService.d';
import type { VersionService } from '../../../../src/modeles/versionService';

type InformationsService = {
  visible: Record<EtapeService, boolean>;
  version: VersionService;
};

type RouteurStoreProps = {
  location: string;
  informationsService?: InformationsService;
};

const { subscribe, update } = writable<RouteurStoreProps>({
  location: window.location.pathname,
});

window.addEventListener('popstate', () => {
  update((etat) => {
    etat.location = window.location.pathname;
    return etat;
  });
});

const rubriquesGereesParSPA: Array<EtapeService> = [
  'mesures',
  'descriptionService',
];

type NavExterne = (url: string) => void;
const navigue = (
  url: string,
  navigueHorsSPA: NavExterne = (url) => {
    window.location.href = url;
  }
) => {
  const morceaux = url.split('/').filter(Boolean);
  const pageDemandee = (morceaux.at(-1) || '') as EtapeService;
  const pageVisible =
    get(routeurStore).informationsService?.visible[pageDemandee];
  if (pageVisible && rubriquesGereesParSPA.includes(pageDemandee)) {
    history.pushState({}, '', url);
    update((etat) => {
      etat.location = url;
      return etat;
    });
  } else {
    navigueHorsSPA(url);
  }
};

const chargeInformationsService = (
  informationsService: InformationsService
) => {
  update((etat) => {
    etat.informationsService = informationsService;
    return etat;
  });
};

export const routeurStore = {
  chargeInformationsService,
  subscribe,
  navigue,
};

export const pageCourante = derived(routeurStore, ($r) => {
  const morceaux = $r.location.split('/').filter(Boolean);
  return morceaux.at(-1) as EtapeService;
});
