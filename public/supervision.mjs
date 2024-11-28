import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const optionsFiltrageDate = lisDonneesPartagees(
    'referentiel-options-filtrage-date'
  );
  const entitesSupervisees = lisDonneesPartagees('entites-supervisees');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-supervision', {
      detail: { optionsFiltrageDate, entitesSupervisees },
    })
  );
});
