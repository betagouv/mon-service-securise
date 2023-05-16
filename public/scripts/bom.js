import { EVENEMENT_BASCULE_TIROIR } from '../modules/tableauDeBord/gestionnaireTiroir.mjs';

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

  $(document).on(EVENEMENT_BASCULE_TIROIR, (_, { ouvert }) => {
    const $bom = $('.bom');
    if (ouvert) $bom.addClass('disparu');
    else $bom.removeClass('disparu');
  });
});
