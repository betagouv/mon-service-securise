/* eslint-disable no-underscore-dangle */

const brancheComportementCarrousel = (selecteurCarrousel) => {
  const $conteneur = $(selecteurCarrousel);
  const $carrousel = $('.conteneur-carrousel', $conteneur);
  const $conteneurLiens = $('.conteneur-liens-carrousel', $conteneur);

  const largeurCarte = $($carrousel.children()[0]).width();

  $('.precedent', $conteneurLiens).on('click', () => {
    const decalageCourant = $carrousel.scrollLeft();
    $carrousel.scrollLeft(decalageCourant - largeurCarte);
  });

  $('.suivant', $conteneurLiens).on('click', () => {
    const decalageCourant = $carrousel.scrollLeft();
    $carrousel.scrollLeft(decalageCourant + largeurCarte);
  });

  $carrousel.scrollLeft(0);
};

const etat = {
  _selectionne: 'tag-equipe',
  get selectionne() {
    return this._selectionne;
  },
  set selectionne(valeur) {
    this._selectionne = valeur;
    const tousTags = document.querySelectorAll('.tag-fonctionnalite');
    tousTags.forEach((tag) => {
      console.log(this._selectionne);
      if (tag.id === this._selectionne) tag.setAttribute('pressed', 'true');
      else tag.removeAttribute('pressed');
    });
  },
};
const brancheComportementTagsGroupeUnique = () => {
  const tousTags = document.querySelectorAll('.tag-fonctionnalite');
  tousTags.forEach((tag) => {
    tag.addEventListener('selected', (cible) => {
      etat.selectionne = cible.detail;
    });
    tag.addEventListener('unselected', (cible) => {
      etat.selectionne = cible.detail;
    });
  });
};

$(() => {
  brancheComportementCarrousel('#carrousel-presentation');
  brancheComportementCarrousel('#carrousel-temoignages');
  brancheComportementTagsGroupeUnique('#tag-group-selection-unique');
});
