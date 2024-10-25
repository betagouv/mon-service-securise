$(() => {
  const idService = $('.page-service').data('id-service');
  const { estLectureSeule } = JSON.parse($('#autorisations-risques').text());
  const risques = JSON.parse($('#donnees-risques').text());
  const categories = JSON.parse($('#donnees-referentiel-categories').text());
  const niveauxVraisemblance = JSON.parse(
    $('#donnees-referentiel-vraisemblances').text()
  );
  const niveauxGravite = JSON.parse($('#donnees-referentiel-gravite').text());
  const referentielRisques = JSON.parse(
    $('#donnees-referentiel-risques').text()
  );
  const { matriceNiveauxRisque, niveauxRisque } = JSON.parse(
    $('#donnees-referentiel-niveaux-risque').text()
  );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-risques', {
      detail: {
        idService,
        estLectureSeule,
        risques,
        categories,
        niveauxGravite,
        referentielRisques,
        niveauxVraisemblance,
        matriceNiveauxRisque,
        niveauxRisque,
      },
    })
  );
});
