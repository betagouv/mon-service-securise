import adaptateurAjaxAxios from './adaptateurAjaxAxios.mjs';
import {
  declencheValidation,
  declencheValidationFormulairesMultiple,
  EVENEMENT_FORMULAIRE_MULTIPLE_VALIDE,
} from './interactions/validation.mjs';
import basculeEnCoursChargement from './enregistreRubrique.mjs';

const initialiseComportementFormulaire = (
  selecteurFormulaire,
  selecteurBouton,
  fonctionExtractionParametres,
  navigationEtapes,
  callbackErreur = () => {},
  adaptateurAjax = adaptateurAjaxAxios
) => {
  const $bouton = $(selecteurBouton);
  const identifiantService = $bouton.attr('idHomologation');
  const requete = identifiantService
    ? { method: 'put', url: `/api/service/${identifiantService}` }
    : { method: 'post', url: '/api/service' };
  const $form = $(selecteurFormulaire);

  $form.on(EVENEMENT_FORMULAIRE_MULTIPLE_VALIDE, async () => {
    basculeEnCoursChargement($bouton, true);
    requete.data = fonctionExtractionParametres(selecteurFormulaire);

    const redirige = ({ data: { idService } }) => {
      const estCreationDeService = !identifiantService;
      if (estCreationDeService) {
        $('#modale-creation-service')[0].showModal();
        setTimeout(() => {
          window.location = `/service/${idService}/mesures`;
        }, 3000);
      } else {
        window.location = `/service/${idService}/descriptionService`;
      }
    };

    try {
      const donnees = await adaptateurAjax.execute(requete);
      basculeEnCoursChargement($bouton, false);
      redirige(donnees);
    } catch (e) {
      basculeEnCoursChargement($bouton, false);
      callbackErreur(e);
    }
  });

  $bouton.on('click', () => {
    declencheValidation(selecteurFormulaire);
    const indicePremierFormulaireInvalide =
      declencheValidationFormulairesMultiple($form);
    if (indicePremierFormulaireInvalide)
      navigationEtapes.afficheEtapeN(indicePremierFormulaireInvalide);
  });
};

export default initialiseComportementFormulaire;
