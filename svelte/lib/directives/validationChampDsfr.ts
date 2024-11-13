type TypeNoeud = HTMLTextAreaElement | HTMLSelectElement | HTMLInputElement;

type MessagesValidite = {
  invalide: string;
  valide: string;
};

export const validationChampDsfr = (
  noeud: TypeNoeud,
  messages: MessagesValidite
) => {
  if (!messages.invalide || !messages.valide) return;

  let messageErreur = document.createElement('span');
  messageErreur.classList.add('erreur-champ-saisie-dsfr');
  messageErreur.style.display = 'none';

  let messageValide = document.createElement('span');
  messageValide.classList.add('valide-champ-saisie-dsfr');
  messageValide.style.display = 'none';

  noeud.after(messageErreur);
  noeud.after(messageValide);
  noeud.setCustomValidity('');

  noeud.addEventListener('invalid', onInvalid);
  noeud.addEventListener('input', onInput);

  function onInvalid(e: Event) {
    e.preventDefault();
    messageValide.textContent = '';
    messageValide.style.display = 'none';

    messageErreur.textContent = messages.invalide;
    messageErreur.style.display = 'flex';
  }

  function onInput() {
    if (noeud.checkValidity()) {
      messageValide.textContent = messages.valide;
      messageValide.style.display = 'flex';
    }
    if (noeud.validationMessage === '') {
      messageErreur.style.display = 'none';
      messageErreur.textContent = '';
    }
  }

  return {
    destroy() {
      noeud.removeEventListener('invalid', onInvalid);
      noeud.removeEventListener('input', onInput);
    },
  };
};
