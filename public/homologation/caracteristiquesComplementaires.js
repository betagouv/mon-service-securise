$(() => {
  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    window.location = `/homologation/${identifiantHomologation}`;
  });
});
