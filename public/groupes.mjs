import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { avecGroupesServices, avecGroupesEntites } =
    lisDonneesPartagees('donnees-groupes');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-groupes', {
      detail: { avecGroupesServices, avecGroupesEntites },
    })
  );
});
