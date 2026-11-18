import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const donnees = lisDonneesPartagees('donnees-observatoire');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-observatoire', {
      detail: { ...donnees },
    })
  );
});
