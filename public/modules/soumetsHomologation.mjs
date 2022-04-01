import adaptateurAjaxAxios from './adaptateurAjaxAxios.mjs';
import ErreurSeuilCriticiteTropEleve from './erreurs.mjs';
import parametres from './parametres.mjs';

const redirigeVersSynthese = ({ data: { idHomologation } }) => (
  window.location = `/homologation/${idHomologation}`
);

const afficheModale = () => $('*').trigger('afficheModale');

const soumetsHomologation = (
  adaptateurAjax, requete, selecteurFormulaire, fonctionExtractionParametres
) => {
  const params = fonctionExtractionParametres(selecteurFormulaire);
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
  { fonctionExtractionParametres = parametres, adaptateurAjax = adaptateurAjaxAxios }
) => {
  const $bouton = $(selecteurBouton);
  const identifiantHomologation = $bouton.attr('identifiant');
  const requete = identifiantHomologation
    ? { method: 'put', url: `/api/homologation/${identifiantHomologation}` }
    : { method: 'post', url: '/api/homologation' };
  const $form = $(selecteurFormulaire);

  $form.on('submit', ((evenement) => {
    evenement.preventDefault();
    soumetsHomologation(adaptateurAjax, requete, selecteurFormulaire, fonctionExtractionParametres);
  }));

  $bouton.on('click', () => $form.trigger('submit'));
};

export default initialiseComportementFormulaire;
