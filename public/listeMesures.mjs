import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const statuts = lisDonneesPartagees('referentiel-statuts-mesures');
  const typesService = lisDonneesPartagees('referentiel-types-service');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-liste-mesures', {
      detail: { statuts, typesService },
    })
  );
});
