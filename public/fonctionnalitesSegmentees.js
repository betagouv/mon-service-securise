$(() => {
  const conteneur = $('.fonctionnalites');

  $('.fonctionnalite', conteneur).on('click', (e) => {
    const fonctionnalite = $(e.currentTarget);
    const image = fonctionnalite.find('img');

    $('.fonctionnalite img', conteneur).addClass('invisible');
    image.removeClass('invisible');

    $('.fonctionnalite', conteneur).removeClass('active');
    fonctionnalite.addClass('active');

    const estMobile = window.matchMedia('(max-width: 1200px)');

    if (estMobile.matches) {
      fonctionnalite[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      $('.illustration-fonctionnalites-segmentees-desktop').attr(
        'src',
        image.attr('src')
      );
      $('.illustration-fonctionnalites-segmentees-desktop').attr(
        'alt',
        image.attr('alt')
      );
    }
  });

  $('.controle-segmente-fonctionnalites').on('valuechanged', (e) => {
    const index = e.detail;
    $('.conteneur-fonctionnalites').addClass('invisible');
    $(`.conteneur-fonctionnalites[data-index="${index}"]`).removeClass(
      'invisible'
    );

    $('.fonctionnalite', conteneur).removeClass('active');
    const premiereFonctionnalite = $(
      `.conteneur-fonctionnalites[data-index="${index}"] .fonctionnalite:first-of-type`,
      conteneur
    );
    premiereFonctionnalite.addClass('active');
    const image = premiereFonctionnalite.find('img');
    $('.illustration-fonctionnalites-segmentees-desktop').attr(
      'src',
      image.attr('src')
    );
    $('.illustration-fonctionnalites-segmentees-desktop').attr(
      'alt',
      image.attr('alt')
    );
  });
});
