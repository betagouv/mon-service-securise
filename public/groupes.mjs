$(() => {
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-groupes', {
      detail: {},
    })
  );
});
