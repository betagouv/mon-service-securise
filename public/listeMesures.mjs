import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const utilisateurConnecte = lisDonneesPartagees('utilisateur-connecte');
  const statuts = lisDonneesPartagees('referentiel-statuts-mesures');
  const categories = lisDonneesPartagees('referentiel-categories-mesures');
  const typesService = lisDonneesPartagees('referentiel-types-service');
  const nombreMaximumModelesMesureSpecifique = lisDonneesPartagees(
    'referentiel-nombre-maximum-modeles-mesure-specifique'
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
        capaciteAjoutDeMesure: {
          nombreMaximum: nombreMaximumModelesMesureSpecifique,
        },
        utilisateurEstAdmin: utilisateurConnecte.estAdmin,
        utilisateurEstSuperviseur: utilisateurConnecte.estSuperviseur,
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
