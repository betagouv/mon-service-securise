$(() => {
  const $bouton = $('.bouton');
  $bouton.click(() => {
    const prenom = $('#prenom').val();
    const nom = $('#nom').val();
    const email = $('#email').val();
    const motDePasse = $('#mot-de-passe').val();

    axios.post('/api/utilisateur', { prenom, nom, email, motDePasse })
      .then(() => (window.location = '/homologations'));
  });
});
