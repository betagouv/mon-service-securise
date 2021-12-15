const COULEURS_NIVEAUX_GRAVITE = ['blanc', 'vert', 'jaune', 'orange', 'rouge'];

const metsAJourAffichageNiveauGravite = ($parent, niveauCourant, position, description) => {
  $('input', $parent).val(niveauCourant);

  const $disques = $('.disque', $parent);
  $disques.removeClass('eteint');
  $disques.removeClass(COULEURS_NIVEAUX_GRAVITE.join(' '));
  $disques.addClass((i) => (i <= position ? COULEURS_NIVEAUX_GRAVITE[position] : 'eteint'));
  $disques.first().toggleClass('cercle', position === 0);
  $('.legende', $parent).text(description);
};

const brancheComportementSaisieNiveauGravite = ($parent, niveaux) => {
  const $disques = $('.disque', $parent);
  $disques.click((e) => {
    e.preventDefault();
    const $disque = $(e.target);
    const niveau = $disque.attr('niveau');

    const { position, description } = niveaux[niveau];
    metsAJourAffichageNiveauGravite($parent, niveau, position, description);
  });
};

export {
  brancheComportementSaisieNiveauGravite,
  metsAJourAffichageNiveauGravite,
};
