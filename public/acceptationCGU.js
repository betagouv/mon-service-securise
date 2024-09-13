$(() => {
  const selecteurFormulaire = 'form#acceptationCGU';
  const reponseAcceptee = (nom) =>
    $(`#${nom}:checked`).val() ? true : undefined;

  $(selecteurFormulaire).on('submit', (e) => {
    e.preventDefault();

    axios
      .put('/api/utilisateur/acceptationCGU', {
        cguAcceptees: reponseAcceptee('cguAcceptees'),
        infolettreAcceptee: reponseAcceptee('infolettreAcceptee'),
      })
      .then(() => (window.location = '/tableauDeBord'));
  });
});
