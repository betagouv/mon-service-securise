import adaptateurAjaxAxios from './adaptateurAjaxAxios.mjs';
import { brancheValidation, declencheValidation } from './interactions/validation.mjs';

const initialiseComportementFormulaire = (
  selecteurFormulaire,
  selecteurBouton,
  fonctionExtractionParametres,
  adaptateurAjax = adaptateurAjaxAxios
) => {
  const $bouton = $(selecteurBouton);
  const identifiantHomologation = $bouton.attr('idHomologation');
  const requete = identifiantHomologation
    ? { method: 'put', url: `/api/homologation/${identifiantHomologation}` }
    : { method: 'post', url: '/api/homologation' };
  const $form = $(selecteurFormulaire);

  brancheValidation(selecteurFormulaire);
  $form.on('submit', ((evenement) => {
    evenement.preventDefault();
    requete.data = fonctionExtractionParametres(selecteurFormulaire);

    const redirigeVersSynthese = ({ data: { idHomologation } }) => (
      window.location = `/homologation/${idHomologation}`
    );

    adaptateurAjax.execute(requete)
      .then(redirigeVersSynthese);
  }));

  $bouton.on('click', () => {
    declencheValidation(selecteurFormulaire);
  });
};

export default initialiseComportementFormulaire;
