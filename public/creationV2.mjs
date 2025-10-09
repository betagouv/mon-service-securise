import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { entite } = lisDonneesPartagees('donnees-profil');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-creation-v2', { detail: { entite } })
  );
});
