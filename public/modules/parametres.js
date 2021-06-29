const avecPremierElementCommeValeurs = (params, nomsParamsAtomiques) => {
  const resultat = params;
  Object.keys(params).forEach((clef) => {
    if (nomsParamsAtomiques.includes(clef)) [resultat[clef]] = params[clef];
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
  const nomsParamsAtomiques = $
    .map($('input[type!="checkbox"]'), ($i) => $i.name)
    .filter((nom, index, nomsParams) => nomsParams.indexOf(nom) === index);
  return avecPremierElementCommeValeurs(params, nomsParamsAtomiques);
};

export { parametres as default };
