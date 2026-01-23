$(() => {
  const $bouton = $('.bouton');

  $bouton.click(() => {
    const email = $('#email').val();

    if (!email) return;

    axios
      .post('/api/reinitialisationMotDePasse', { email })
      .then(() => (window.location = '/connexion'));
  });
});
