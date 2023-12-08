$(() => {
  const mesures = JSON.parse($('#donnees-mesures').text());
  const referentielMesuresGenerales = JSON.parse(
    $('#donnees-referentiel-mesures-generales').text()
  );
  const categories = JSON.parse($('#referentiel-categories-mesures').text());
  const statuts = JSON.parse($('#referentiel-statuts-mesures').text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-mesures', {
      detail: { mesures, referentielMesuresGenerales, categories, statuts },
    })
  );
});
