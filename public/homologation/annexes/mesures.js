import telechargementPdf from '../../modules/interactions/telechargementPdf.js';

$(() => {
  $('#telecharger').on('click', telechargementPdf('annexeMesures.pdf'));
});
