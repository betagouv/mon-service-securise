$(() => {
  const idService = $('.page-service').data('id-service');

  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-risques-v2', {
      detail: { idService },
    })
  );
});
