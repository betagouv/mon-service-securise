import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const { sections, articles } = lisDonneesPartagees('donnees-conseils-cyber');
  const donneesArticles = articles.map((a) => ({
    idCategorie: a.section.id,
    titre: a.titre,
    href: `/articles/${a.slug}`,
  }));
  const couleurs = {
    '0cef9600-977a-4817-9735-8717942a4920': {
      accent: 'blue-cumulus',
    },
    '09d78fb4-fe9a-4f60-9dd7-91232e98d419': {
      accent: 'pink-macaron',
    },
  };
  const categories = sections.reduce(
    (acc, v) => ({
      ...acc,
      [v.id]: {
        label: v.nom,
        accent: couleurs[v.id].accent,
      },
    }),
    {}
  );
  const query = new URLSearchParams(window.location.search);
  const sectionSelectionnee = query.get('section') ?? '';
  document.body.dispatchEvent(
    new CustomEvent('svelte-recharge-conseils-cyber', {
      detail: { donneesArticles, categories, sectionSelectionnee },
    })
  );
});
