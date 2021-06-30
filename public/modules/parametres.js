const avecPremierElementCommeValeurs = (params, nomsParamsAtomiques) => {
  const resultat = params;
  Object.keys(params).forEach((clef) => {
    if (nomsParamsAtomiques.includes(clef)) [resultat[clef]] = params[clef];
  });

  return resultat;
};

const nomsInput = (selecteurInputs) => $
  .map($(selecteurInputs), ($i) => $i.name)
  .filter((nom, index, nomsParams) => nomsParams.indexOf(nom) === index);

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

  const nomsParamsMultiples = nomsInput(`${selecteurFormulaire} input[type="checkbox"]`);
  nomsParamsMultiples.forEach((n) => (params[n] ||= []));

  const nomsParamsAtomiques = nomsInput(`${selecteurFormulaire} input[type!="checkbox"], ${selecteurFormulaire} textarea`);
  return avecPremierElementCommeValeurs(params, nomsParamsAtomiques);
};

export { parametres as default };
