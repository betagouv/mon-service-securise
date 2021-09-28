import parametres from '../modules/parametres.js';

$(() => {
  const $formulaire = $('form.utilisateur#edition');
  $formulaire.submit((e) => {
    e.preventDefault();

    const params = parametres('form#edition');
    params.cguAcceptees = params.cguAcceptees && params.cguAcceptees[0] === 'on';

    axios.put('/api/utilisateur', params)
      .then(() => (window.location = '/homologations'));
  });

  const $bouton = $('.bouton');
  $bouton.click(() => $formulaire.submit());
});
