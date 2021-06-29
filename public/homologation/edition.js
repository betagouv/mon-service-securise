import parametres from '../modules/parametres.js';

$(() => {
  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametres('form#homologation');

    axios.put(`/api/homologation/${identifiantHomologation}`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
