import parametres from '../modules/parametres.js';

$(() => {
  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    const params = parametres('form#caracteristiques-complementaires');
    axios.post(
      `/api/homologation/${identifiantHomologation}/caracteristiquesComplementaires`,
      params,
    ).then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
