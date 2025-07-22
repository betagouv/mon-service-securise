import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const statuts = lisDonneesPartagees('referentiel-statuts-mesures');
  const typesService = lisDonneesPartagees('referentiel-types-service');
  const afficheModelesMesureSpecifique = lisDonneesPartagees(
    'affiche-modeles-mesure-specifique'
  );
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-liste-mesures', {
      detail: { statuts, typesService, afficheModelesMesureSpecifique },
    })
  );
});
