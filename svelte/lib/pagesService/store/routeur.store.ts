import { get, writable } from 'svelte/store';
import type { EtapeService } from '../../menuNavigationService/menuNavigationService.d';
import type { VersionService } from '../../../../src/modeles/versionService';
import { pagesServiceGerees } from '../pagesServiceGerees';
import { tiroirStore } from '../../ui/stores/tiroir.store';
import { pageDepuisURL } from './pageDepuisURL';
import { titresPages } from '../titresPages.donnees';
import { trackDansMatomo } from '../../ui/matomo';

type CommandePaq = [string, ...unknown[]];

declare global {
  interface Window {
    _paq?: CommandePaq[];
  }
}

export type InformationsService = {
  visible: Record<EtapeService, boolean>;
  version: VersionService;
  modeVisiteGuidee?: boolean;
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

type NavExterne = (url: string) => void;

const navigue = (
  url: string,
  navigueHorsSPA: NavExterne = (url) => {
    window.location.href = url;
  }
) => {
  const informationsService = get(routeurStore).informationsService;
  if (informationsService?.modeVisiteGuidee) {
    navigueHorsSPA(url);
    return;
  }

  const pageDemandee = pageDepuisURL(url) || '';
  const pageVisible = informationsService?.visible[pageDemandee];
  const versionService = informationsService?.version;

  const descriptionServicePourV1 =
    pageDemandee === 'descriptionService' && versionService === 'v1';
  if (
    pageVisible &&
    pagesServiceGerees.includes(pageDemandee) &&
    !descriptionServicePourV1
  ) {
    const titrePage = `${titresPages[pageDemandee]} | MonServiceSécurisé`;
    document.title = titrePage;
    trackDansMatomo(url, get(routeurStore).location, titrePage);

    history.pushState({}, '', url);
    update((etat) => {
      etat.location = url;
      return etat;
    });

    tiroirStore.ferme();
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

export const routeurStore = { chargeInformationsService, subscribe, navigue };
