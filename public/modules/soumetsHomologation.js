import parametres from './parametres.js';

const soumetsHomologation = (url, selecteurFormulaire) => {
  const params = parametres(selecteurFormulaire);
  Object.assign(url, { data: params });

  axios(url)
    .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
};

export { soumetsHomologation as default };
