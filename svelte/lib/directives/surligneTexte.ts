type TypeNoeud = HTMLParagraphElement;

export const surligneTexte = (noeud: TypeNoeud, terme: string) => {
  const surligne = (terme: string) => {
    const texte = noeud.innerText;
    noeud.innerHTML = texte.replace(
      new RegExp(terme, 'i'),
      (texte) => `<mark>${texte}</mark>`
    );
  };
  surligne(terme);

  return {
    update(terme: string) {
      surligne(terme);
    },
    destroy() {},
  };
};
