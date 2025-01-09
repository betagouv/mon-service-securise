const afficheModale = ($rideauModale) => {
  $('body').addClass('recouvert');
  $rideauModale.addClass('visible');
};

const initialiseComportementModale = ($rideauModale) => {
  $rideauModale
    .on('click', (e) => e.stopPropagation())
    .on('afficheModale', () => afficheModale($rideauModale));
};

export default initialiseComportementModale;
