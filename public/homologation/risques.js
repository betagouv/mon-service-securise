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
  $bouton.click(() => {});
});
