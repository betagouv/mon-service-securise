$(() => {
  $('#valider-cgu').on('click', () => {
    axios
      .put('/api/utilisateur/acceptationCGU')
      .then(() => (window.location = '/tableauDeBord'));
  });
});
