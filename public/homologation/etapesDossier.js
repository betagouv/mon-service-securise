import { brancheValidation, declencheValidation } from '../modules/interactions/validation.js';

const action = (idEtape, idHomologation) => {
  let resultat = Promise.resolve();

  if (idEtape === 2) {
    const donnees = {
      dateHomologation: $('#date-homologation').val(),
      dureeValidite: $('input[name="dureeValidite"]:checked').val(),
    };

    resultat = axios.put(`/api/homologation/${idHomologation}/dossier`, donnees);
  }

  return resultat;
};

const brancheComportemenFormulaire = (
  selecteurFormulaire,
  idHomologation,
  idEtape,
  idEtapeSuivante
) => {
  brancheValidation(selecteurFormulaire);

  $(selecteurFormulaire).on('submit', (e) => {
    e.preventDefault();
    action(idEtape, idHomologation)
      .then(() => (
        window.location = `/homologation/${idHomologation}/dossier/edition/etape/${idEtapeSuivante}`
      ));
  });
};

$(() => {
  const $boutonSuivant = $('.bouton#suivant');
  const $boutonFinal = $('.bouton#final');

  const idHomologation = $boutonSuivant.data('id-homologation') || $boutonFinal.data('id-homologation');
  const idEtape = $boutonSuivant.data('id-etape');
  const idEtapeSuivante = $boutonSuivant.data('id-etape-suivante');

  const selecteurFormulaire = 'form';
  brancheComportemenFormulaire(selecteurFormulaire, idHomologation, idEtape, idEtapeSuivante);

  $boutonSuivant.on('click', () => declencheValidation(selecteurFormulaire));
  $boutonFinal.on('click', () => (window.location = `/homologation/${idHomologation}/dossiers`));
});
