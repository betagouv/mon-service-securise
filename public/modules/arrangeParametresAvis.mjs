import { modifieParametresAvecItemsExtraits } from './parametres.mjs';

const arrangeParametresAvis = (params) => {
  modifieParametresAvecItemsExtraits(
    params,
    'avis',
    '^(collaborateurs|statut|dureeValidite|commentaires)-un-avis-'
  );

  return params;
};

export default arrangeParametresAvis;
