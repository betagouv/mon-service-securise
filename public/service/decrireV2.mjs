import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const descriptionService = lisDonneesPartagees('donnees-description-service');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-decrire-v2', {
      detail: { descriptionService },
    })
  );
});
