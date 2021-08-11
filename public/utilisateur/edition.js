$(() => {
  const $bouton = $('.bouton');
  $bouton.click(() => {
    const motDePasse = $('#mot-de-passe').val();

    axios.put('/api/utilisateur', { motDePasse })
      .then(() => (window.location = '/homologations'));
  });
});
