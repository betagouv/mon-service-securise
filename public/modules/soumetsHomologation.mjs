import parametres, { modifieParametresAvecItemsExtraits } from './parametres.mjs';
import listesAvecItemsExtraits from '../homologation/formulaireDescriptionService.js';

const fermeModale = () => {
  $('.rideau').css('display', '');
  $('body').css('overflow', '');
};

const afficheModaleSeuilCritique = () => {
  $('body').css('overflow', 'hidden');
  $('.rideau').css('display', 'flex');
};

const tousLesParametres = (selecteurFormulaire) => {
  const params = parametres(selecteurFormulaire);
  listesAvecItemsExtraits.forEach(
    ({ cle, sourceRegExpParamsItem }) => (
      modifieParametresAvecItemsExtraits(params, cle, sourceRegExpParamsItem)
    )
  );
  return params;
};

const initialiseComportementModale = () => {
  $('.fermeture-modale').click((eFermeture) => {
    eFermeture.stopPropagation();
    fermeModale();
  });
};

const soumetsHomologation = (url, selecteurFormulaire) => {
  const params = tousLesParametres(selecteurFormulaire);
  Object.assign(url, { data: params });

  axios.get('/api/seuilCriticite', { params })
    .then(({ data: { seuilCriticite } }) => {
      if (seuilCriticite === 'critique') afficheModaleSeuilCritique();
      else {
        axios(url)
          .then(({ data: { idHomologation } }) => (window.location = `/homologation/${idHomologation}`));
      }
    });
};

const initialiseComportementFormulaire = (selecteurFormulaire, selecteurBouton) => {
  initialiseComportementModale();

  const $bouton = $(selecteurBouton);
  const identifiantHomologation = $bouton.attr('identifiant');
  const url = identifiantHomologation
    ? { method: 'put', url: `/api/homologation/${identifiantHomologation}` }
    : { method: 'post', url: '/api/homologation' };
  const $form = $(selecteurFormulaire);

  $form.submit((e) => {
    e.preventDefault();
    soumetsHomologation(url, selecteurFormulaire);
  });

  $bouton.click(() => $form.submit());
};

export { initialiseComportementFormulaire as default };
