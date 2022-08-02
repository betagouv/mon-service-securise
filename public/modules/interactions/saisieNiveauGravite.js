const metsAJourAffichageNiveauGravite = (
  $parent,
  niveauCourant,
  couleurs,
  position,
  description
) => {
  $('input', $parent).val(niveauCourant);

  const $disques = $('.disque', $parent);
  $disques.removeClass('eteint');
  $disques.removeClass(couleurs.join(' '));
  $disques.addClass((i) => (i <= position ? couleurs[position] : 'eteint'));
  $disques.first().toggleClass('cercle', position === 0);
  $('.legende', $parent).text(description);
};

const brancheComportementSaisieNiveauGravite = ($parent, niveaux, couleurs) => {
  const $disques = $('.disque', $parent);
  $disques.click((e) => {
    e.preventDefault();
    const $disque = $(e.target);
    const niveau = $disque.data('niveau');

    const { position, description } = niveaux[niveau];
    metsAJourAffichageNiveauGravite($parent, niveau, couleurs, position, description);
  });
};

export {
  brancheComportementSaisieNiveauGravite,
  metsAJourAffichageNiveauGravite,
};
