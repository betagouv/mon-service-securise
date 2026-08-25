import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { infolettreAcceptee, pixelDeSuiviAccepte, transactionnelAccepte } =
    lisDonneesPartagees('donnees-preferences');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-preferences', {
      detail: {
        infolettreAcceptee,
        pixelDeSuiviAccepte,
        transactionnelAccepte,
      },
    })
  );
});
