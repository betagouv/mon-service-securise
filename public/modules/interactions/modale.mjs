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

const brancheModale = (selecteurAffichageModale, rideauModale) => {
  const $rideauModale = $(rideauModale);
  initialiseComportementModale($rideauModale);

  $(selecteurAffichageModale).on('click', (eAffichage) => {
    eAffichage.preventDefault();
    $rideauModale.trigger('afficheModale');
  });
};

const brancheModales = (selecteurAffichageModale) => {
  $(selecteurAffichageModale).each((_, afficheur) => {
    const rideauModale = $(afficheur).children('.rideau').first();
    brancheModale(afficheur, rideauModale);
  });
};

export { brancheModale, brancheModales, initialiseComportementModale };
