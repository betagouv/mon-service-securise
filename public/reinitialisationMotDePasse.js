$(() => {
  const $bouton = $('.bouton');

  $bouton.click(() => {
    const email = $('#email').val();
    axios
      .post('/api/reinitialisationMotDePasse', { email })
      .then(() => (window.location = '/connexion'));
  });
});
