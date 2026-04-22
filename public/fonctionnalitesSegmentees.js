$(() => {
  const conteneur = $('.fonctionnalites');

  $('.fonctionnalite', conteneur).on('click', (e) => {
    const fonctionnalite = $(e.currentTarget);

    $('.fonctionnalite img', conteneur).addClass('invisible');
    fonctionnalite.find('img').removeClass('invisible');
    fonctionnalite[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('.controle-segmente-fonctionnalites').on('valuechanged', (e) => {
    const index = e.detail;
    $('.conteneur-fonctionnalites').addClass('invisible');
    $(`.conteneur-fonctionnalites[data-index="${index}"]`).removeClass(
      'invisible'
    );
  });
});
