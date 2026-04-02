import { writable } from 'svelte/store';

const { subscribe, set } = writable({ location: window.location.pathname });

window.addEventListener('popstate', () => {
  set({ location: window.location.pathname });
});

const navigue = (url: string) => {
  const morceaux = url.split('/').filter(Boolean);
  const pageDemandee = morceaux.at(-1) || '';
  if (['mesures', 'descriptionService'].includes(pageDemandee)) {
    history.pushState({}, '', url);
    set({ location: url });
  } else {
    window.location.href = url;
  }
};

export const routeurStore = {
  subscribe,
  navigue,
};
