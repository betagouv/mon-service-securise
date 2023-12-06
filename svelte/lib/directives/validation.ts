type TypeNoeud = HTMLTextAreaElement | HTMLSelectElement;

export const validation = (node: TypeNoeud, message: string) => {
  let messageErreur = document.createElement('span');
  messageErreur.classList.add('erreur-champ-saisie');
  messageErreur.style.display = 'none';
  node.after(messageErreur);

  node.addEventListener('invalid', gereInvalide);
  node.addEventListener('input', gereModification);

  function gereInvalide() {
    messageErreur.textContent = message;
    messageErreur.style.display = 'flex';
    node.classList.add('invalide');
  }

  function gereModification() {
    if (node.validationMessage == '') {
      messageErreur.textContent = '';
      messageErreur.style.display = 'none';
      node.classList.remove('invalide');
    }
  }

  return {
    destroy() {
      node.removeEventListener('invalid', gereInvalide);
      node.removeEventListener('input', gereModification);
    },
  };
};
