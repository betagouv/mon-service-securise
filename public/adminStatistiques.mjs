import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const referentiel = lisDonneesPartagees('referentiel');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-admin-statistiques', {
      detail: { referentiel },
    })
  );
});
