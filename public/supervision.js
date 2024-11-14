$(() => {
  const optionsFiltrageDate = JSON.parse(
    $('#referentiel-options-filtrage-date').text()
  );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-supervision', {
      detail: { optionsFiltrageDate },
    })
  );
});
