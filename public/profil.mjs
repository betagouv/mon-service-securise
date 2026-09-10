import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { utilisateur, estimationNombreServices, entite } =
    lisDonneesPartagees('donnees-profil');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-profil', {
      detail: { utilisateur, estimationNombreServices, entite },
    })
  );
});
