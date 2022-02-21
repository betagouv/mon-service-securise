const ajouteInformationsModales = () => {
  $('.puce-information').click((eInformation) => {
    $('body').css('overflow', 'hidden');
    $('.rideau', $(eInformation.target)).css('display', 'flex');

    $('.fermeture-modale', $(eInformation.target)).click((eFermeture) => {
      eFermeture.stopPropagation();
      $('.rideau', $(eInformation.target)).css('display', '');
      $('body').css('overflow', '');
    });
  });
};

export default ajouteInformationsModales;
