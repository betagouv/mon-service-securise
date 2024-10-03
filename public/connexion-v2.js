$(() => {
  const $urlRedirection = $('#url-redirection');
  const { urlRedirection } = JSON.parse($urlRedirection.text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-connexion', {
      detail: {
        urlRedirection,
      },
    })
  );
});
