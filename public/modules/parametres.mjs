import { capitalise, decapitalise } from './manipulationTexte.mjs';

const avecPremierElementCommeValeurs = (params, nomsParamsAtomiques) => {
  const resultat = params;
  Object.keys(params).forEach((clef) => {
    if (nomsParamsAtomiques.includes(clef)) [resultat[clef]] = params[clef];
  });

  return resultat;
};

const nomsInput = (selecteurInputs) =>
  $.map($(selecteurInputs), ($i) => $i.name).filter(
    (nom, index, nomsParams) => nomsParams.indexOf(nom) === index
  );

const parametres = (selecteurFormulaire) => {
  const params = $(selecteurFormulaire)
    .serializeArray()
    .reduce((acc, nomValeur) => {
      const nomParam = nomValeur.name;
      const valeurParam = nomValeur.value;
      acc[nomParam] = acc[nomParam] || [];
      acc[nomParam].push(valeurParam);

      return acc;
    }, {});

  const nomsParamsMultiples = nomsInput(
    `${selecteurFormulaire} input[type="checkbox"], ${selecteurFormulaire} select[multiple='multiple']`
  );
  nomsParamsMultiples.forEach((n) => (params[n] = params[n] || []));

  const nomsParamsAtomiques = nomsInput(
    `${selecteurFormulaire} input[type!="checkbox"], ${selecteurFormulaire} textarea, ${selecteurFormulaire} select[multiple!='multiple']`
  );
  return avecPremierElementCommeValeurs(params, nomsParamsAtomiques);
};

const modifieParametresAvecItemsExtraits = (
  params,
  nomListeItems,
  sourceRegExpParamsItem
) => {
  const donneesItems = { [nomListeItems]: [] };

  Object.keys(params)
    .filter((p) => !!p.match(new RegExp(sourceRegExpParamsItem)))
    .forEach((p) => {
      if (params[p]) {
        const resultat = p.match(
          new RegExp(`${sourceRegExpParamsItem}([0-9]*)$`)
        );
        const propriete = resultat[1];
        let index = resultat[2];
        index = parseInt(index, 10);
        donneesItems[nomListeItems][index] =
          donneesItems[nomListeItems][index] || {};
        donneesItems[nomListeItems][index][propriete] = params[p];
      }
      delete params[p];
    });

  return Object.assign(params, donneesItems);
};

const modifieParametresGroupementElements = (
  params,
  nomListe,
  nomParametre
) => {
  const donneesFormatees = {};

  Object.keys(params)
    .filter((param) => !!param.match(new RegExp(`^${nomParametre}\\w*$`)))
    .forEach((param) => {
      if (params[param]) {
        const resultat = param.match(new RegExp(`^${nomParametre}(\\w*)$`));
        const propriete = decapitalise(resultat[1]);
        donneesFormatees[nomParametre] = donneesFormatees[nomParametre] || {};
        donneesFormatees[nomParametre][propriete] = params[param];
      }
      delete params[param];
    });

  const listeFormatee = Object.keys(donneesFormatees).map((cle) => ({
    ...donneesFormatees[cle],
    type: capitalise(cle),
  }));

  params[nomListe] = [...(params[nomListe] || []), ...listeFormatee];
  return params;
};

const parametresAvecItemsExtraits = (
  selecteurForm,
  nomListeItems,
  sourceRegExpParamsItem
) => {
  const params = parametres(selecteurForm);
  return modifieParametresAvecItemsExtraits(
    params,
    nomListeItems,
    sourceRegExpParamsItem
  );
};

export default parametres;
export {
  parametresAvecItemsExtraits,
  modifieParametresAvecItemsExtraits,
  modifieParametresGroupementElements,
};
