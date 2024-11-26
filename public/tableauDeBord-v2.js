$(() => {
  const { estSuperviseur } = JSON.parse($('#utilisateur-superviseur').text());

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-de-bord', {
      detail: { estSuperviseur },
    })
  );
});
