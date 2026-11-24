import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { avecGroupesEntites } = lisDonneesPartagees('donnees-groupes');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-groupes', {
      detail: { avecGroupesEntites },
    })
  );
});
