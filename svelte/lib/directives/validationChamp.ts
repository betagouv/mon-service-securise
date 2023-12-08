type TypeNoeud = HTMLTextAreaElement | HTMLSelectElement;

export const validationChamp = (
  noeud: TypeNoeud,
  messageSiInvalide: string
) => {
  let messageErreur = document.createElement('span');
  messageErreur.classList.add('erreur-champ-saisie');
  messageErreur.style.display = 'none';
  noeud.after(messageErreur);

  noeud.addEventListener('invalid', onInvalid);
  noeud.addEventListener('input', onInput);

  function onInvalid() {
    messageErreur.textContent = messageSiInvalide;
    messageErreur.style.display = 'flex';
    noeud.classList.add('invalide');
  }

  function onInput() {
    if (noeud.validationMessage == '') {
      messageErreur.textContent = '';
      messageErreur.style.display = 'none';
      noeud.classList.remove('invalide');
    }
  }

  return {
    destroy() {
      noeud.removeEventListener('invalid', onInvalid);
      noeud.removeEventListener('input', onInput);
    },
  };
};
