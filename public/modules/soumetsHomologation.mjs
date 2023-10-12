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

    const redirige = ({ data: { idService } }) => {
      const estCreationDeService = !identifiantService;
      window.location = estCreationDeService
        ? `/service/${idService}/mesures`
        : `/service/${idService}/descriptionService`;
    };

    adaptateurAjax.execute(requete).then(redirige).catch(callbackErreur);
  });

  $bouton.on('click', () => {
    declencheValidation(selecteurFormulaire);
  });
};

export default initialiseComportementFormulaire;
