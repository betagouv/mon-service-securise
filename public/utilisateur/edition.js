import parametres from '../modules/parametres.js';

$(() => {
  const $bouton = $('.bouton');
  $bouton.click(() => {
    const params = parametres('form#edition');
    params.cguAcceptees &&= params.cguAcceptees[0] === 'on';

    axios.put('/api/utilisateur', params)
      .then(() => (window.location = '/homologations'));
  });
});
