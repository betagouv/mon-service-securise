const brancheMenuContextuelService = ($service) => {
  $('.menu-contextuel-titre', $service).on('click', (evenement) => {
    evenement.preventDefault();

    const $optionsLocales = $('.menu-contextuel-options', $service);
    const $masqueLocal = $('.masque', $service);
    $('.menu-contextuel-options').not($optionsLocales).addClass('invisible');
    $('.masque').not($masqueLocal).addClass('invisible');
    $optionsLocales.toggleClass('invisible');
    $masqueLocal.toggleClass('invisible');

    $('.masque', $service).on('click', (e) => {
      e.preventDefault();
    });
  });

  $('.menu-contextuel-options .supprimer', $service).on('click', (e) => {
    e.preventDefault();
    const donnees = { idService: $service.data('id'), nomService: $service.data('nom') };
    $service.trigger('modaleSuppression', donnees);
  });
};

export default brancheMenuContextuelService;
