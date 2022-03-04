$(() => {
  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.on('click', () => {
    window.location = `/homologation/${identifiantHomologation}`;
  });
});
