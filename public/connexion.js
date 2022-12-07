$(() => {
  const $inputs = $('input');
  const $erreur = $('.message-erreur');
  const $bouton = $('.bouton');

  const rendsAffichageNeutre = () => {
    $erreur.hide();
  };
  const afficheAlerte = () => {
    $erreur.show();
  };
  rendsAffichageNeutre();
  $inputs.addClass('intouche');
  $inputs.on('input', rendsAffichageNeutre);

  $bouton.on('click', () => {
    const login = $('#login').val();
    const motDePasse = $('#mot-de-passe').val();
    axios.post('/api/token', { login, motDePasse })
      .then(() => (window.location = '/espacePersonnel'))
      .catch((error) => {
        if (error.response.status === 401) {
          afficheAlerte();
        }
      });
  });
});
