import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const statuts = lisDonneesPartagees('referentiel-statuts-mesures');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-liste-mesures', { detail: { statuts } })
  );
});
