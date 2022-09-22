import telechargementPdf from '../modules/interactions/telechargementPdf.js';
import graphiqueCamembert from '../modules/graphiqueCamembert.js';

$(() => {
  graphiqueCamembert('indispensables', '.indispensables');

  $('#telecharger').on('click', telechargementPdf('syntheseSecurite.pdf'));
});
