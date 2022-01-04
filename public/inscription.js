$(() => {
  const $bouton = $('.bouton');
  $bouton.click(() => {
    const prenom = $('#prenom').val();
    const nom = $('#nom').val();
    const email = $('#email').val();

    axios.post('/api/utilisateur', { prenom, nom, email })
      .then(() => (window.location = '/espacePersonnel'));
  });
});
