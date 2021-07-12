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

const brancheInputsIdentite = (idsInputsIdentite) => {
  axios.get('/api/utilisateurCourant')
    .then((reponse) => {
      const { prenomNom } = reponse.data.utilisateur;
      idsInputsIdentite.forEach((ids) => relieInputsIdentite(
        ids.idJeSuis, ids.idZoneSaisie, prenomNom
      ));
    });
};

export { brancheInputsIdentite as default };
