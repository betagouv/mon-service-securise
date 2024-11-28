import lisDonneesPartagees from './modules/donneesPartagees.mjs';

$(() => {
  const { urlRedirection } = lisDonneesPartagees('url-redirection');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-connexion', {
      detail: {
        urlRedirection,
      },
    })
  );
});
