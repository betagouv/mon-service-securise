import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const statuts = lisDonneesPartagees('referentiel-statuts-mesures');
  const categories = lisDonneesPartagees('referentiel-categories-mesures');
  const typesService = lisDonneesPartagees('referentiel-types-service');
  const afficheModelesMesureSpecifique = lisDonneesPartagees(
    'affiche-modeles-mesure-specifique'
  );
  const nombreMaximumModelesMesureSpecifique = lisDonneesPartagees(
    'referentiel-nombre-maximum-modeles-mesure-specifique'
  );
  const nombreRestantModelesMesureSpecifique = lisDonneesPartagees(
    'nombre-restant-modeles-mesure-specifique'
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
        capaciteAjoutDeMesure: {
          peutAjouter: nombreRestantModelesMesureSpecifique > 0,
          nombreRestant: nombreRestantModelesMesureSpecifique,
          nombreMaximum: nombreMaximumModelesMesureSpecifique,
        },
      },
    })
  );

  const url = new URLSearchParams(window.location.search);
  if (url.has('rapportTeleversement')) {
    document.body.dispatchEvent(
      new CustomEvent(
        'svelte-recharge-rapport-televersement-modeles-mesure-specifique',
        {
          detail: {
            capaciteAjoutDeMesure: {
              nombreMaximum: nombreMaximumModelesMesureSpecifique,
            },
          },
        }
      )
    );
  }
});
