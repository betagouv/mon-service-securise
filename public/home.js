const brancheComportementCarrousel = (selecteurCarrousel) => {
  const $conteneur = $(selecteurCarrousel);
  const $carrousel = $('.conteneur-carrousel', $conteneur);
  const $conteneurLiens = $('.conteneur-liens-carrousel', $conteneur);

  const largeurCarte = $($carrousel.children()[0]).width();

  $carrousel.on('scroll', (e) => {
    const cible = $(e.currentTarget);
    const scroll = cible.scrollLeft();
    const total = $carrousel.children().length * largeurCarte;

    if (scroll < largeurCarte / 2)
      $('.precedent', $conteneurLiens).attr('disabled', 'disabled');
    else $('.precedent', $conteneurLiens).removeAttr('disabled');

    if (scroll + largeurCarte > total - largeurCarte / 2)
      $('.suivant', $conteneurLiens).attr('disabled', 'disabled');
    else $('.suivant', $conteneurLiens).removeAttr('disabled');
  });

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

$(() => {
  brancheComportementCarrousel('#carrousel-presentation');
  brancheComportementCarrousel('#carrousel-temoignages');
});
