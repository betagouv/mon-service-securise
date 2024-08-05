$(() => {
  const sections = JSON.parse($('#sections-blog').text());
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-blog', { detail: { sections } })
  );
});
