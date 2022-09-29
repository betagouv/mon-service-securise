import adaptateurAjaxAxios from './adaptateurAjaxAxios.mjs';

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

  $form.on('submit', ((evenement) => {
    evenement.preventDefault();
    requete.data = fonctionExtractionParametres(selecteurFormulaire);

    const redirigeVersSynthese = ({ data: { idHomologation } }) => (
      window.location = `/homologation/${idHomologation}`
    );

    adaptateurAjax.execute(requete)
      .then(redirigeVersSynthese);
  }));

  $bouton.on('click', () => $form.trigger('submit'));
};

export default initialiseComportementFormulaire;
