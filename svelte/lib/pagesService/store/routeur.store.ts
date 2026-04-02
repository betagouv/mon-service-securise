import { writable } from 'svelte/store';

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
