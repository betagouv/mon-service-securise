$(() => {
  $('#valider-cgu').on('click', () => {
    if ($('#cguAcceptees').is(':checked')) {
      axios
        .put('/api/utilisateur/acceptationCGU')
        .then(() => (window.location = '/tableauDeBord'));
    }
  });
});
