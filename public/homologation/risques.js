import parametres from '../modules/parametres.js';

$(() => {
  $('.information').click((eInformation) => {
    $('body').css('overflow', 'hidden');
    $('.rideau', $(eInformation.target)).css('display', 'flex');

    $('.fermeture-modale', $(eInformation.target)).click((eFermeture) => {
      eFermeture.stopPropagation();
      $('.rideau', $(eInformation.target)).css('display', '');
      $('body').css('overflow', '');
    });
  });

  $('.risque').each((_, $r) => {
    const $lien = $('a', $r);
    const nom = `commentaire-${$r.id}`;
    const $zoneSaisie = $(`<textarea id=${nom} name=${nom}></textarea>`);
    $zoneSaisie.hide();
    $lien.click(() => $zoneSaisie.toggle());

    $zoneSaisie.appendTo($r);
  });

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametres('form#risques');
    axios.post(`/api/homologation/${identifiantHomologation}/risques`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
