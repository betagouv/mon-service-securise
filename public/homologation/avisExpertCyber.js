import parametres from '../modules/parametres.js';
import brancheInputsIdentite from '../modules/brancheInputsIdentite.js';

$(() => {
  const idsInputsIdentite = [
    { idJeSuis: '#je-suis-expert-cybersecurite', idZoneSaisie: '#expert-cybersecurite' },
  ];

  brancheInputsIdentite(idsInputsIdentite);

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    idsInputsIdentite
      .map((ids) => ids.idZoneSaisie)
      .forEach((selecteur) => $(selecteur).removeAttr('disabled'));

    const params = parametres('form#avis-expert-cyber');
    axios.post(`/api/homologation/${identifiantHomologation}/partiesPrenantes`, params)
      .then(() => axios.post(`/api/homologation/${identifiantHomologation}/avisExpertCyber`, params))
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
