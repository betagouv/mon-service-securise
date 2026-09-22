import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { cles } = lisDonneesPartagees('donnees-cle-api');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-cle-api', {
      detail: { cles },
    })
  );
});
