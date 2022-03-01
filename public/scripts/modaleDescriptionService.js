const fermeModale = () => {
  $('.rideau').css('display', '');
  $('body').css('overflow', '');
};

const initialiseComportementModale = () => {
  $('.fermeture-modale').on('click', (eFermeture) => {
    eFermeture.stopPropagation();
    fermeModale();
  });
};

$(initialiseComportementModale);
