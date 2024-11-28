import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const sections = lisDonneesPartagees('sections-blog');
  const articles = lisDonneesPartagees('articles-blog');
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-blog', { detail: { sections, articles } })
  );
});
