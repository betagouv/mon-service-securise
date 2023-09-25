import adaptateurAjaxAxios from './adaptateurAjaxAxios.mjs';
import {
  brancheValidation,
  declencheValidation,
} from './interactions/validation.mjs';

const initialiseComportementFormulaire = (
  selecteurFormulaire,
  selecteurBouton,
  fonctionExtractionParametres,
  callbackErreur = () => {},
  adaptateurAjax = adaptateurAjaxAxios
) => {
  const $bouton = $(selecteurBouton);
  const identifiantService = $bouton.attr('idHomologation');
  const requete = identifiantService
    ? { method: 'put', url: `/api/service/${identifiantService}` }
    : { method: 'post', url: '/api/service' };
  const $form = $(selecteurFormulaire);

  brancheValidation(selecteurFormulaire);
  $form.on('submit', (evenement) => {
    evenement.preventDefault();
    requete.data = fonctionExtractionParametres(selecteurFormulaire);

    const redirigeVersSynthese = ({ data: { idService } }) =>
      (window.location = `/service/${idService}/descriptionService`);

    adaptateurAjax
      .execute(requete)
      .then(redirigeVersSynthese)
      .catch(callbackErreur);
  });

  $bouton.on('click', () => {
    declencheValidation(selecteurFormulaire);
  });
};

export default initialiseComportementFormulaire;
