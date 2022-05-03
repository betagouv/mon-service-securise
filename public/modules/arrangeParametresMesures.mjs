import { modifieParametresAvecItemsExtraits } from './parametres.mjs';

const arrangeParametresMesures = (parametres) => {
  const CLE_MESURES_SPECIFIQUES = 'mesuresSpecifiques';
  const CLE_MESURES_GENERALES = 'mesuresGenerales';

  modifieParametresAvecItemsExtraits(
    parametres,
    CLE_MESURES_SPECIFIQUES,
    '^(description|categorie|statut|modalites)-mesure-specifique-',
  );

  parametres[CLE_MESURES_GENERALES] = parametres[CLE_MESURES_GENERALES] || {};

  parametres[CLE_MESURES_GENERALES] = Object.keys(parametres)
    .filter((nomParametre) => (
      nomParametre !== CLE_MESURES_SPECIFIQUES && nomParametre !== CLE_MESURES_GENERALES
    ))
    .reduce((acc, nomParametre) => {
      if (parametres[nomParametre]) {
        const nomParametreModalites = nomParametre.match(/^modalites-(.*)$/)?.[1];
        if (nomParametreModalites) {
          acc[nomParametreModalites] = acc[nomParametreModalites] || {};
          acc[nomParametreModalites].modalites = parametres[nomParametre];
        } else {
          acc[nomParametre] = acc[nomParametre] || {};
          acc[nomParametre].statut = parametres[nomParametre];
        }
      }
      delete parametres[nomParametre];
      return acc;
    }, parametres[CLE_MESURES_GENERALES]);
};

export default arrangeParametresMesures;
