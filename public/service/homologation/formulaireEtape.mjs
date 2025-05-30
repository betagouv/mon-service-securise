import {
  brancheValidation,
  declencheValidation,
} from '../../modules/interactions/validation.mjs';
import basculeEnCoursChargement from '../../modules/enregistreRubrique.mjs';
import lisDonneesPartagees from '../../modules/donneesPartagees.mjs';

let formulaireDejaSoumis = false;

const brancheComportemenFormulaireEtape = (actionSoumission) => {
  const { estLectureSeule } = lisDonneesPartagees('autorisations-homologuer');
  const $boutonSuivant = $('.bouton#suivant');

  const selecteurFormulaire = 'form.homologation';
  const idService = $boutonSuivant.data('id-homologation');
  const idEtapeSuivante = $boutonSuivant.data('id-etape-suivante');

  brancheValidation(selecteurFormulaire);

  const versEtapeSuivante = () =>
    (window.location = idEtapeSuivante
      ? `/service/${idService}/homologation/edition/etape/${idEtapeSuivante}`
      : `/service/${idService}/dossiers?succesHomologation`);

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

  const modale = $('#modale-parcours-homologation')[0];
  $('#affiche-demarche-homologation').on('click', () => {
    modale.inert = true;
    modale.showModal();
    modale.inert = false;
  });

  $('#nouvelle-homologation').on('click', () => {
    modale.close();
  });
};

export default brancheComportemenFormulaireEtape;
