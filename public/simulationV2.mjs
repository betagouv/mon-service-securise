import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { idService } = lisDonneesPartagees('donnees-id-service');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-simulation-v2', { detail: { idService } })
  );
});
