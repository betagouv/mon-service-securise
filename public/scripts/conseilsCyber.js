$(() => {
  const sections = JSON.parse($('#sections-blog').text());
  const articles = JSON.parse($('#articles-blog').text());
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-blog', { detail: { sections, articles } })
  );
});
