$(() => {
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-tableau-de-bord')
  );
});
