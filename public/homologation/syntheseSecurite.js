import telechargementPdf from '../modules/interactions/telechargementPdf.js';

const brancheDimensionnementStatuts = () => {
  $('.statistiques-par-categorie .statut')
    .each((_, statut) => $(statut).css('flex', $(statut).text()));
};

$(() => {
  $('#telecharger').on('click', telechargementPdf('syntheseSecurite.pdf'));

  brancheDimensionnementStatuts();
});
