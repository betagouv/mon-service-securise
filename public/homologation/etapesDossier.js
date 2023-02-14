import { brancheValidation, declencheValidation } from '../modules/interactions/validation.mjs';

let formulaireDejaSoumis = false;

const action = (idEtape, idService) => {
  let resultat = Promise.resolve();

  if (idEtape === 2) {
    const donnees = {
      dateHomologation: $('#date-homologation').val(),
      dureeValidite: $('input[name="dureeValidite"]:checked').val(),
    };

    resultat = axios.put(`/api/service/${idService}/dossier`, donnees);
  }

  if (idEtape === 3) {
    resultat = axios.put(`/api/service/${idService}/dossier`, { finalise: true });
  }

  return resultat;
};

const brancheComportemenFormulaire = (selecteur, idService, idEtape, idEtapeSuivante) => {
  brancheValidation(selecteur);

  $(selecteur).on('submit', (e) => {
    e.preventDefault();

    if (!formulaireDejaSoumis) {
      formulaireDejaSoumis = true;

      action(idEtape, idService)
        .then(() => (
          window.location = idEtapeSuivante
            ? `/service/${idService}/dossier/edition/etape/${idEtapeSuivante}`
            : `/service/${idService}/dossiers`
        ));
    }
  });
};

$(() => {
  const $boutonSuivant = $('.bouton#suivant');

  const selecteurFormulaire = 'form';
  const idService = $boutonSuivant.data('id-homologation');
  const idEtape = $boutonSuivant.data('id-etape');
  const idEtapeSuivante = $boutonSuivant.data('id-etape-suivante');

  brancheComportemenFormulaire(selecteurFormulaire, idService, idEtape, idEtapeSuivante);

  $boutonSuivant.on('click', () => declencheValidation(selecteurFormulaire));
});
