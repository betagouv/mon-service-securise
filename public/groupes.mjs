import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { groupes } = lisDonneesPartagees('donnees-groupes');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-groupes', {
      detail: { groupes },
    })
  );
});
