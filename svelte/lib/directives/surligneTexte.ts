type TypeNoeud = HTMLParagraphElement;

export const surligneTexte = (noeud: TypeNoeud, terme: string) => {
  const surligne = (terme: string) => {
    const texte = noeud.textContent ?? '';
    noeud.innerHTML = texte
      .replace(new RegExp(terme, 'ig'), (texte) => `<mark>${texte}</mark>`)
      .replaceAll('<br>', '\n');
  };
  surligne(terme);

  return {
    update(terme: string) {
      surligne(terme);
    },
    destroy() {},
  };
};
