import { brancheValidation, declencheValidation } from '../modules/interactions/validation.js';

const brancheComportemenFormulaire = (selecteurFormulaire, idHomologation, idEtapeSuivante) => {
  brancheValidation(selecteurFormulaire);

  $(selecteurFormulaire).on('submit', (e) => {
    e.preventDefault();
    window.location = `/homologation/${idHomologation}/dossier/edition/etape/${idEtapeSuivante}`;
  });
};

$(() => {
  const $boutonSuivant = $('.bouton#suivant');
  const $boutonFinal = $('.bouton#final');

  const idHomologation = $boutonSuivant.data('id-homologation') || $boutonFinal.data('id-homologation');
  const idEtapeSuivante = $boutonSuivant.data('id-etape-suivante');

  const selecteurFormulaire = 'form';
  brancheComportemenFormulaire(selecteurFormulaire, idHomologation, idEtapeSuivante);

  $boutonSuivant.on('click', () => declencheValidation(selecteurFormulaire));
  $boutonFinal.on('click', () => (window.location = `/homologation/${idHomologation}/dossiers`));
});
