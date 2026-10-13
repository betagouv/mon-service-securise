import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const referentiel = lisDonneesPartagees('referentiel');
  const avecGroupesEntites = lisDonneesPartagees('avec-groupes-entites');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-admin-statistiques', {
      detail: { referentiel, avecGroupesEntites },
    })
  );
});
