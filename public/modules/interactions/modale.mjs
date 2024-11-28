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

export default initialiseComportementModale;
