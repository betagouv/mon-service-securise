import { modifieParametresAvecItemsExtraits } from './parametres.mjs';

const arrangeParametresMesures = (parametres) => {
  modifieParametresAvecItemsExtraits(
    parametres,
    'mesuresSpecifiques',
    '^(description|categorie|statut|modalites)-mesure-specifique-',
  );
};

export default arrangeParametresMesures;
