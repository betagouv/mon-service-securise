import { brancheValidation, declencheValidation } from '../../modules/interactions/validation.mjs';

let formulaireDejaSoumis = false;

const brancheComportemenFormulaireEtape = (actionSoumission) => {
  const $boutonSuivant = $('.bouton#suivant');

  const selecteurFormulaire = 'form';
  const idService = $boutonSuivant.data('id-homologation');
  const idEtapeSuivante = $boutonSuivant.data('id-etape-suivante');

  brancheValidation(selecteurFormulaire);

  $(selecteurFormulaire).on('submit', (e) => {
    e.preventDefault();

    if (!formulaireDejaSoumis) {
      formulaireDejaSoumis = true;

      actionSoumission(idService, selecteurFormulaire)
        .then(() => (
          window.location = idEtapeSuivante
            ? `/service/${idService}/dossier/edition/etape/${idEtapeSuivante}`
            : `/service/${idService}/dossiers`
        ));
    }
  });

  $boutonSuivant.on('click', () => declencheValidation(selecteurFormulaire));
};

export default brancheComportemenFormulaireEtape;
