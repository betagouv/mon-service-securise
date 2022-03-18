import parametres from './parametres.mjs';

const redirigeVersSynthese = ({ data: { idHomologation } }) => (
  window.location = `/homologation/${idHomologation}`
);

const afficheModale = () => $('*').trigger('afficheModale');

const soumetsHomologation = (requete, selecteurFormulaire, fonctionExtractionParametres) => {
  const params = fonctionExtractionParametres(selecteurFormulaire);
  requete.data = params;

  axios.get('/api/seuilCriticite', { params }).then(({ data: { seuilCriticite } }) => {
    if (seuilCriticite === 'critique') {
      afficheModale();
      return false;
    }

    return axios(requete).then(redirigeVersSynthese);
  });
};

const initialiseComportementFormulaire = (
  selecteurFormulaire,
  selecteurBouton,
  fonctionExtractionParametres = parametres
) => {
  const $bouton = $(selecteurBouton);
  const identifiantHomologation = $bouton.attr('identifiant');
  const requete = identifiantHomologation
    ? { method: 'put', url: `/api/homologation/${identifiantHomologation}` }
    : { method: 'post', url: '/api/homologation' };
  const $form = $(selecteurFormulaire);

  $form.on('submit', ((evenement) => {
    evenement.preventDefault();
    soumetsHomologation(requete, selecteurFormulaire, fonctionExtractionParametres);
  }));

  $bouton.on('click', () => $form.trigger('submit'));
};

export default initialiseComportementFormulaire;
