import { readable } from 'svelte/store';

const menuEl = document.getElementsByClassName('menu-navigation')[0];
const menuEstOuvert = () => !menuEl.classList.contains('ferme');

export const menuNavigationOuvert = readable<boolean>(
  menuEstOuvert(),
  (set) => {
    const observateur = new MutationObserver((mutations) =>
      mutations.forEach((mutation) => {
        if (mutation.target === menuEl) set(menuEstOuvert());
      })
    );

    observateur.observe(menuEl, {
      attributes: true,
      subtree: false,
      childList: false,
      attributeFilter: ['class'],
    });

    return () => observateur.disconnect();
  }
);
