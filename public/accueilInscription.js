import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { invite } = lisDonneesPartagees('invite');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-accueil-inscription', {
      detail: { invite },
    })
  );
});
