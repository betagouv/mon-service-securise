import parametres from '../modules/parametres.js';

$(() => {
  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametres('form#parties-prenantes');
    axios.post(`/api/homologation/${identifiantHomologation}/partiesPrenantes`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
