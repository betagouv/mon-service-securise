import {
  brancheValidation,
  declencheValidation,
} from '../modules/interactions/validation.mjs';

$(() => {
  const $modale = $('#modale-nouveau-service');
  const selecteurFormulaire = '#modale-nouveau-service form';
  const $caseACocher = $('input#attestation', selecteurFormulaire);
  const $bouton = $('#modale-nouveau-service .bouton.confirmation');

  $modale.on('afficheModale', () => {
    $caseACocher.prop('checked', false);
  });

  brancheValidation(selecteurFormulaire);

  $bouton.on('click', () => {
    declencheValidation(selecteurFormulaire);
  });
});
