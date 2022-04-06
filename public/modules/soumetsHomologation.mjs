import adaptateurAjaxAxios from './adaptateurAjaxAxios.mjs';
import ErreurSeuilCriticiteTropEleve from './erreurs.mjs';

const redirigeVersSynthese = ({ data: { idHomologation } }) => (
  window.location = `/homologation/${idHomologation}`
);

const afficheModale = () => $('*').trigger('afficheModale');

const soumetsHomologation = (adaptateurAjax, requete, params) => {
  requete.data = params;

  adaptateurAjax.verifieSeuilCriticite(params)
    .then(() => adaptateurAjax.execute(requete))
    .then(redirigeVersSynthese)
    .catch((erreur) => {
      if (erreur instanceof ErreurSeuilCriticiteTropEleve) {
        afficheModale();
      }
    });
};

const initialiseComportementFormulaire = (
  selecteurFormulaire,
  selecteurBouton,
  fonctionExtractionParametres,
  adaptateurAjax = adaptateurAjaxAxios,
) => {
  const $bouton = $(selecteurBouton);
  const identifiantHomologation = $bouton.attr('identifiant');
  const requete = identifiantHomologation
    ? { method: 'put', url: `/api/homologation/${identifiantHomologation}` }
    : { method: 'post', url: '/api/homologation' };
  const $form = $(selecteurFormulaire);

  $form.on('submit', ((evenement) => {
    evenement.preventDefault();
    const params = fonctionExtractionParametres(selecteurFormulaire);
    soumetsHomologation(adaptateurAjax, requete, params);
  }));

  $bouton.on('click', () => $form.trigger('submit'));
};

export default initialiseComportementFormulaire;
