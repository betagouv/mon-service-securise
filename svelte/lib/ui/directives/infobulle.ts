export const infobulle = (noeud: HTMLElement, contenu: string) => {
  noeud.addEventListener('mouseover', affiche);
  noeud.addEventListener('mouseleave', masque);

  const elementInfobulle = document.createElement('div');
  const elementContenuInfobulle = document.createElement('p');
  elementInfobulle.classList.add('conteneur-infobulle');
  elementContenuInfobulle.textContent = contenu;
  elementInfobulle.appendChild(elementContenuInfobulle);
  document.body.appendChild(elementInfobulle);

  function affiche() {
    elementInfobulle.style.display = 'flex';
    const { top, left, width } = noeud.getBoundingClientRect();
    const tailleInfobulle = elementInfobulle.getBoundingClientRect();
    elementInfobulle.style.top = `${top - tailleInfobulle.height - 4}px`;
    elementInfobulle.style.left = `${
      left - tailleInfobulle.width / 2 + width / 2
    }px`;
  }

  function masque() {
    elementInfobulle.style.display = 'none';
  }

  return {
    destroy() {
      noeud?.removeEventListener('mouseover', affiche);
      noeud?.removeEventListener('mouseleave', masque);
      elementInfobulle.remove();
    },
  };
};
