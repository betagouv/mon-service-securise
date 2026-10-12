import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { avecGroupesEntites } = lisDonneesPartagees('donnees-admin-entites');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-admin-entites', {
      detail: { avecGroupesEntites },
    })
  );
});
