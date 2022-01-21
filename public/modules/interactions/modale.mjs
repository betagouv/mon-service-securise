const afficheModale = ($rideauModale) => {
  $('body').addClass('recouvert');
  $rideauModale.addClass('visible');
};

const fermeModale = ($rideauModale) => {
  $rideauModale.removeClass('visible');
  $('body').removeClass('recouvert');
};

const initialiseComportementModale = ($rideauModale) => {
  $rideauModale
    .on('click', (e) => e.stopPropagation())
    .on('afficheModale', () => afficheModale($rideauModale))
    .on('fermeModale', () => fermeModale($rideauModale));

  $('.fermeture-modale', $rideauModale).on('click', (eFermeture) => {
    eFermeture.stopPropagation();
    $rideauModale.trigger('fermeModale');
  });
};

const brancheModales = (selecteurAffichageModale, selecteurParentRideau) => {
  $(selecteurAffichageModale).each((_, afficheur) => {
    const $parentRideau = selecteurParentRideau ? $(selecteurParentRideau) : $(afficheur);
    const $rideauModale = $('.rideau', $parentRideau);
    initialiseComportementModale($rideauModale);
  });

  $(selecteurAffichageModale).on('click', (eAffichage) => {
    eAffichage.preventDefault();
    const $parentRideau = selecteurParentRideau ? $(selecteurParentRideau) : $(eAffichage.target);
    const $rideauModale = $('.rideau', $parentRideau);
    $rideauModale.trigger('afficheModale');
  });
};

export { brancheModales, initialiseComportementModale };
