import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const idService = $('.page-service').data('id-service');
  const statuts = lisDonneesPartagees('referentiel-statuts-mesures');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-risques-v2', {
      detail: { idService, statuts },
    })
  );
});
