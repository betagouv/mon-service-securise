import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const idService = $('.page-service').data('id-service');
  const { estLectureSeule } = lisDonneesPartagees('autorisations-risques');
  const risques = lisDonneesPartagees('donnees-risques');
  const categories = lisDonneesPartagees('donnees-referentiel-categories');
  const niveauxVraisemblance = lisDonneesPartagees(
    'donnees-referentiel-vraisemblances'
  );
  const niveauxGravite = lisDonneesPartagees('donnees-referentiel-gravite');
  const referentielRisques = lisDonneesPartagees('donnees-referentiel-risques');
  const { matriceNiveauxRisque, niveauxRisque } = lisDonneesPartagees(
    'donnees-referentiel-niveaux-risque'
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
