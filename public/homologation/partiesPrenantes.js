import parametres from '../modules/parametres.js';

const relieInputsIdentite = (selecteurCheckbox, selecteurPrenomNom, prenomNom) => {
  const $checkbox = $(selecteurCheckbox);
  const $prenomNom = $(selecteurPrenomNom);

  if ($prenomNom.val() === prenomNom) {
    $checkbox.attr('checked', true);
    $prenomNom.attr('disabled', 'disabled');
  }

  $checkbox.change((event) => {
    if ($(event.target).is(':checked')) $prenomNom.val(prenomNom).attr('disabled', 'disabled');
    else $prenomNom.val('').removeAttr('disabled');
  });
};

$(() => {
  axios.get('/api/utilisateurCourant')
    .then((reponse) => {
      const { prenomNom } = reponse.data.utilisateur;
      relieInputsIdentite('#je-suis-pilote-projet', '#pilote-projet', prenomNom);
      relieInputsIdentite('#je-suis-expert-cybersecurite', '#expert-cybersecurite', prenomNom);
    });

  const $bouton = $('.bouton');
  const identifiantHomologation = $bouton.attr('identifiant');

  $bouton.click(() => {
    ['#pilote-projet', '#expert-cybersecurite']
      .forEach((selecteur) => $(selecteur).removeAttr('disabled'));
    const params = parametres('form#parties-prenantes');

    axios.post(`/api/homologation/${identifiantHomologation}/partiesPrenantes`, params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
