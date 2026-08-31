import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const {
    infolettreAcceptee,
    pixelDeSuiviAccepte,
    transactionnelAccepte,
    preferencesRecapitulatif,
  } = lisDonneesPartagees('donnees-preferences');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-preferences', {
      detail: {
        consentements: {
          infolettreAcceptee,
          pixelDeSuiviAccepte,
          transactionnelAccepte,
        },
        recapitulatifHebdomadaire: preferencesRecapitulatif,
      },
    })
  );
});
