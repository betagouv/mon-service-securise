$(() => {
  const $bouton = $('.bouton');
  $bouton.on('click', () => {
    const login = $('#login').val();
    const motDePasse = $('#mot-de-passe').val();
    axios.post('/api/token', { login, motDePasse })
      .then(() => {
        window.location = '/homologations';
      });
  });
});
