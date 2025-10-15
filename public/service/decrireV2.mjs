import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const service = lisDonneesPartagees('donnees-service');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-decrire-v2', { detail: { service } })
  );
});
