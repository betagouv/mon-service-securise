import {
  brancheValidation,
  declencheValidation,
} from '../../modules/interactions/validation.mjs';
import basculeEnCoursChargement from '../../modules/enregistreRubrique.mjs';

let formulaireDejaSoumis = false;

const brancheComportemenFormulaireEtape = (actionSoumission) => {
  const { estLectureSeule } = JSON.parse($('#autorisations-homologuer').text());
  const $boutonSuivant = $('.bouton#suivant');

  const selecteurFormulaire = 'form';
  const idService = $boutonSuivant.data('id-homologation');
  const idEtapeSuivante = $boutonSuivant.data('id-etape-suivante');

  brancheValidation(selecteurFormulaire);

  const versEtapeSuivante = () =>
    (window.location = idEtapeSuivante
      ? `/service/${idService}/homologation/edition/etape/${idEtapeSuivante}`
      : `/service/${idService}/dossiers`);

  $(selecteurFormulaire).on('submit', async (e) => {
    e.preventDefault();

    if (estLectureSeule) {
      versEtapeSuivante();
      return;
    }

    if (!formulaireDejaSoumis) {
      formulaireDejaSoumis = true;
      basculeEnCoursChargement($boutonSuivant, false);
      await actionSoumission(idService, selecteurFormulaire);
      basculeEnCoursChargement($boutonSuivant, true);
      versEtapeSuivante();
    }
  });

  $boutonSuivant.on('click', () => declencheValidation(selecteurFormulaire));
};

export default brancheComportemenFormulaireEtape;
