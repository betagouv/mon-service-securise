const avecPremierElementCommeValeurs = (params, nomsParams) => {
  const resultat = params;
  Object.keys(params).forEach((clef) => {
    if (nomsParams.includes(clef)) [resultat[clef]] = params[clef];
  });

  return resultat;
};

const parametres = (selecteurFormulaire) => {
  const params = $(selecteurFormulaire)
    .serializeArray()
    .reduce((acc, nomValeur) => {
      const nomParam = nomValeur.name;
      const valeurParam = nomValeur.value;
      acc[nomParam] ||= [];
      acc[nomParam].push(valeurParam);

      return acc;
    }, {});
  return avecPremierElementCommeValeurs(params, ['nomService']);
};

$(() => {
  const $bouton = $('.bouton');
  $bouton.click(() => {
    const params = parametres('form#homologation');

    axios.post('/api/homologation', params)
      .then((reponse) => (window.location = `/homologation/${reponse.data.idHomologation}`));
  });
});
