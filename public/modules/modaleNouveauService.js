(() => {
  const $modale = $('#modale-nouveau-service');
  const $form = $modale.find('form');
  const $checkbox = $form.find('input#attestation');
  const $button = $form.find('button[type=submit]');

  $checkbox.on('click', () => {
    $button.prop('disabled', $checkbox.prop('checked') === false);
  });

  $modale.on('afficheModale', () => {
    $checkbox.prop('checked', false);
    $button.prop('disabled', true);
  });
})();
