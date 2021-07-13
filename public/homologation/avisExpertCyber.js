import parametres from '../modules/parametres.js';

$(() => {
  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametres('form#avis-expert-cyber');
    axios.post(`/api/homologation/${identifiantHomologation}/avisExpertCyber`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
