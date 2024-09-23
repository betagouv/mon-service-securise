$(() => {
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-inscription', {
      detail: {},
    })
  );
});
