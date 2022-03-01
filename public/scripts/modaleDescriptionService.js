const afficheModale = (selecteurModale) => {
  $('body').css('overflow', 'hidden');
  $(selecteurModale).css('display', 'flex');
};

const fermeModale = (selecteurModale) => {
  $(selecteurModale).css('display', '');
  $('body').css('overflow', '');
};

const initialiseComportementModale = (selecteurModale) => {
  $(selecteurModale)
    .on('afficheModaleDescriptionService', () => afficheModale(selecteurModale))
    .on('fermeModaleDescriptionService', () => fermeModale(selecteurModale));

  $('.fermeture-modale').on('click', (eFermeture) => {
    eFermeture.stopPropagation();
    $(selecteurModale).trigger('fermeModaleDescriptionService');
  });
};

$(() => initialiseComportementModale('.rideau'));
