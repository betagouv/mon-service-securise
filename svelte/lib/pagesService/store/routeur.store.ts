import { get, writable } from 'svelte/store';
import type { EtapeService } from '../../menuNavigationService/menuNavigationService.d';
import type { VersionService } from '../../../../src/modeles/versionService';
import { pagesServiceGerees } from '../pagesServiceGerees';
import { tiroirStore } from '../../ui/stores/tiroir.store';
import { pageDepuisURL } from './pageDepuisURL';
import { titresPages } from '../titresPages.donnees';

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

const trackMatomo = (url: string, titrePage: string) => {
  const sansIdService = (u: string) =>
    u.replace(
      /\/service\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\//,
      '/service/{ID}/'
    );
  const urlCompleteSansId = (u: string) =>
    window.location.origin + sansIdService(u) + window.location.search;

  window._paq = window._paq || [];
  const { _paq } = window;

  _paq.push(['setReferrerUrl', urlCompleteSansId(get(routeurStore).location)]);
  _paq.push(['setCustomUrl', urlCompleteSansId(url)]);
  _paq.push(['setGenerationTimeMs', 0]);
  _paq.push(['setDocumentTitle', titrePage]);
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
};

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
    trackMatomo(url, titrePage);

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
