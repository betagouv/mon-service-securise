import { get, writable } from 'svelte/store';
import type { EtapeService } from '../../menuNavigationService/menuNavigationService.d';
import type { VersionService } from '../../../../src/modeles/versionService';
import { pagesServiceGerees } from '../pagesServiceGerees';
import { tiroirStore } from '../../ui/stores/tiroir.store';
import { pageDepuisURL } from './pageDepuisURL';

export type InformationsService = {
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

type NavExterne = (url: string) => void;

const navigue = (
  url: string,
  navigueHorsSPA: NavExterne = (url) => {
    window.location.href = url;
  }
) => {
  const pageDemandee = pageDepuisURL(url) || '';
  const informationsService = get(routeurStore).informationsService;
  const pageVisible = informationsService?.visible[pageDemandee];
  const versionService = informationsService?.version;

  const descriptionServicePourV1 =
    pageDemandee === 'descriptionService' && versionService === 'v1';
  if (
    pageVisible &&
    pagesServiceGerees.includes(pageDemandee) &&
    !descriptionServicePourV1
  ) {
    history.pushState({}, '', url);
    update((etat) => {
      etat.location = url;
      return etat;
    });
    tiroirStore.ferme();
    document.body.dispatchEvent(new CustomEvent('ferme-tiroir'));
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
