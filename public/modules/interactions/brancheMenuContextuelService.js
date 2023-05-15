const brancheMenuContextuelService = ($service) => {
  $('.menu-contextuel-titre', $service).on('click', (evenement) => {
    evenement.preventDefault();

    const $masqueLocal = $('.masque', $service);
    const $menuContextuelLocal = $('.menu-contextuel', $service);
    $('.masque').not($masqueLocal).addClass('invisible');
    $('.menu-contextuel')
      .not($menuContextuelLocal)
      .removeClass('menu-contextuel-ouvert');

    $masqueLocal.toggleClass('invisible');
    $menuContextuelLocal.toggleClass('menu-contextuel-ouvert');

    $('.masque', $service).on('click', (e) => {
      e.preventDefault();
    });
  });

  $('.menu-contextuel-options .dupliquer', $service).on('click', (e) => {
    e.preventDefault();
    const donnees = {
      idService: $service.data('id'),
      nomService: $service.data('nom'),
    };
    $service.trigger('modaleDuplication', donnees);
  });

  $('.menu-contextuel-options .supprimer', $service).on('click', (e) => {
    e.preventDefault();
    const donnees = {
      idService: $service.data('id'),
      nomService: $service.data('nom'),
    };
    $service.trigger('modaleSuppression', donnees);
  });
};

export default brancheMenuContextuelService;
