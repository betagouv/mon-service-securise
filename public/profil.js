import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { utilisateur, departements, estimationNombreServices, entite } =
    lisDonneesPartagees('donnees-profil');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-profil', {
      detail: { utilisateur, departements, estimationNombreServices, entite },
    })
  );
});
