import { derived, writable } from 'svelte/store';
import type { EtapeService } from '../../menuNavigationService/menuNavigationService.d';

const { subscribe, set } = writable({ location: window.location.pathname });

window.addEventListener('popstate', () => {
  set({ location: window.location.pathname });
});

const navigue = (url: string) => {
  history.pushState({}, '', url);
  set({ location: url });
};

export const routeurStore = {
  subscribe,
  navigue,
};

export const pageCourante = derived(routeurStore, ($r) => {
  const morceaux = $r.location.split('/').filter(Boolean);
  return morceaux.at(-1) as EtapeService;
});
