import ErreurSeuilCriticiteTropEleve from './erreurs.mjs';

const execute = (requete) => axios(requete);

const verifieSeuilCriticite = (params) => axios.get('/api/seuilCriticite', { params })
  .then(({ data: { seuilCriticite } }) => {
    if (seuilCriticite === 'critique') {
      return Promise.reject(new ErreurSeuilCriticiteTropEleve('Seuil de criticité critique'));
    }
    return Promise.resolve();
  });

const adaptateurAjaxAxios = { execute, verifieSeuilCriticite };

export default adaptateurAjaxAxios;
