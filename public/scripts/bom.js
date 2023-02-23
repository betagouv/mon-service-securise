$(() => {
  const $bomReplie = $('.bom .bom-titre, .bom .bom-vignette');
  const $bomModale = $('.bom .bom-modale');

  $bomReplie.on('click', () => {
    $bomReplie.hide();
    $bomModale.show();
  });

  $('.bom .bom-modale .fermeture').on('click', () => {
    $bomReplie.show();
    $bomModale.hide();
  });
});
