$(() => {
  const optionsFiltrageDate = JSON.parse(
    $('#referentiel-options-filtrage-date').text()
  );
  const entitesSupervisees = JSON.parse($('#entites-supervisees').text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-supervision', {
      detail: { optionsFiltrageDate, entitesSupervisees },
    })
  );
});
