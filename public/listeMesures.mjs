import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const statuts = lisDonneesPartagees('referentiel-statuts-mesures');
  const categories = lisDonneesPartagees('referentiel-categories-mesures');
  const typesService = lisDonneesPartagees('referentiel-types-service');
  const afficheModelesMesureSpecifique = lisDonneesPartagees(
    'affiche-modeles-mesure-specifique'
  );

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-liste-mesures', {
      detail: {
        statuts,
        categories: Object.entries(categories).map(([id, label]) => ({
          id,
          label,
        })),
        typesService,
        afficheModelesMesureSpecifique,
      },
    })
  );
});
