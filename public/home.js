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

$(() => {
  brancheComportementCarrousel('#carrousel-presentation');
  brancheComportementCarrousel('#carrousel-temoignages');
});
