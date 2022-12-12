import { brancheValidation, declencheValidation } from '../modules/interactions/validation.js';

let formulaireDejaSoumis = false;

const action = (idEtape, idHomologation) => {
  let resultat = Promise.resolve();

  if (idEtape === 2) {
    const donnees = {
      dateHomologation: $('#date-homologation').val(),
      dureeValidite: $('input[name="dureeValidite"]:checked').val(),
    };

    resultat = axios.put(`/api/homologation/${idHomologation}/dossier`, donnees);
  }

  if (idEtape === 3) {
    resultat = axios.put(`/api/homologation/${idHomologation}/dossier`, { finalise: true });
  }

  return resultat;
};

const brancheComportemenFormulaire = (selecteur, idHomologation, idEtape, idEtapeSuivante) => {
  brancheValidation(selecteur);

  $(selecteur).on('submit', (e) => {
    e.preventDefault();

    if (!formulaireDejaSoumis) {
      formulaireDejaSoumis = true;

      action(idEtape, idHomologation)
        .then(() => (
          window.location = idEtapeSuivante
            ? `/homologation/${idHomologation}/dossier/edition/etape/${idEtapeSuivante}`
            : `/homologation/${idHomologation}/dossiers`
        ));
    }
  });
};

$(() => {
  const $boutonSuivant = $('.bouton#suivant');

  const selecteurFormulaire = 'form';
  const idHomologation = $boutonSuivant.data('id-homologation');
  const idEtape = $boutonSuivant.data('id-etape');
  const idEtapeSuivante = $boutonSuivant.data('id-etape-suivante');

  brancheComportemenFormulaire(selecteurFormulaire, idHomologation, idEtape, idEtapeSuivante);

  $boutonSuivant.on('click', () => declencheValidation(selecteurFormulaire));
});
