import brancheChampsMotDePasse from '../modules/interactions/brancheChampsMotDePasse.mjs';
import {
  brancheValidation,
  declencheValidation,
} from '../modules/interactions/validation.mjs';

$(() => {
  const reponseAcceptee = (nom) =>
    $(`#${nom}:checked`).val() ? true : undefined;

  const selecteurFormulaire = 'form.mot-de-passe#edition';

  brancheValidation(selecteurFormulaire);
  const $boutonValider = $("button[type = 'submit']", $(selecteurFormulaire));
  $boutonValider.on('click', () => declencheValidation(selecteurFormulaire));

  $(selecteurFormulaire).on('submit', (e) => {
    e.preventDefault();

    const donnees = {
      motDePasse: $('#mot-de-passe').val(),
      cguAcceptees: reponseAcceptee('cguAcceptees'),
    };

    axios
      .put('/api/motDePasse', donnees)
      .then(() => (window.location = '/tableauDeBord'));
  });

  brancheChampsMotDePasse($(selecteurFormulaire));
});
