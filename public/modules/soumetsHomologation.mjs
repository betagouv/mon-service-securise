import adaptateurAjaxAxios from './adaptateurAjaxAxios.mjs';
import { brancheValidation, declencheValidation } from './interactions/validation.mjs';

const initialiseComportementFormulaire = (
  selecteurFormulaire,
  selecteurBouton,
  fonctionExtractionParametres,
  adaptateurAjax = adaptateurAjaxAxios
) => {
  const $bouton = $(selecteurBouton);
  const identifiantService = $bouton.attr('idHomologation');
  const requete = identifiantService
    ? { method: 'put', url: `/api/service/${identifiantService}` }
    : { method: 'post', url: '/api/service' };
  const $form = $(selecteurFormulaire);

  brancheValidation(selecteurFormulaire);
  $form.on('submit', ((evenement) => {
    evenement.preventDefault();
    requete.data = fonctionExtractionParametres(selecteurFormulaire);

    const redirigeVersSynthese = ({ data: { idService } }) => (
      window.location = `/service/${idService}`
    );

    adaptateurAjax.execute(requete)
      .then(redirigeVersSynthese);
  }));

  $bouton.on('click', () => {
    declencheValidation(selecteurFormulaire);
  });
};

export default initialiseComportementFormulaire;
