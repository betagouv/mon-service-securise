const brancheComportementCarrousel = (selecteurCarrousel) => {
  const $conteneur = $(selecteurCarrousel);
  const $carrousel = $('.conteneur-carrousel', $conteneur);
  const $conteneurLiens = $('.conteneur-liens-carrousel', $conteneur);
  const $boutonsLienDirect = $('.lien-carte', $conteneurLiens);

  const margeColonne = parseFloat($carrousel.css('gap').replace('px', ''));
  const margeDebut = parseFloat(
    $carrousel
      .children('.carte-carrousel')
      .first()
      .css('margin-left')
      .replace('px', '')
  );
  const margesDebutFin =
    margeDebut +
    parseFloat(
      $carrousel
        .children('.carte-carrousel')
        .last()
        .css('margin-right')
        .replace('px', '')
    );
  const largeurCarte = $carrousel.find('.carte-carrousel').width();
  const largeurTotale = largeurCarte + margeColonne + margesDebutFin;

  const afficheLienActif = (idx) => {
    $('.lien-carte', $conteneurLiens).removeClass('actif');
    const cible = $conteneurLiens.children('.lien-carte')[idx];
    if (cible) $(cible).addClass('actif');
  };

  const glisseVers = (idx) => {
    const decallage = margeDebut + idx * (largeurCarte + margeColonne);
    $carrousel.scrollLeft(decallage);
  };

  $carrousel.on('scroll', () => {
    const decalageCourant = $carrousel.scrollLeft();
    const idxSlideActif = Math.round(decalageCourant / largeurTotale);
    afficheLienActif(idxSlideActif);
  });

  $boutonsLienDirect.on('click', (e) => {
    const bouton = $(e.target);
    glisseVers(bouton.data('cible'));
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
});
