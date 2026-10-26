import lisDonneesPartagees from '../modules/donneesPartagees.mjs';

$(() => {
  const { sections, articles } = lisDonneesPartagees('donnees-conseils-cyber');
  const donneesArticles = articles.map((a) => ({
    idCategorie: a.section.id,
    titre: a.titre,
    href: `/articles/${a.slug}`,
  }));
  const couleurs = {
    'mise-en-oeuvre-des-mesures': {
      accent: 'blue-cumulus',
    },
    'securisation-et-homologation': {
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
