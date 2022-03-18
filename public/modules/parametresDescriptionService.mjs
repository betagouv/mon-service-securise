import parametres, { modifieParametresAvecItemsExtraits } from './parametres.mjs';
import listesAvecItemsExtraits from './listesAvecItemsExtraits.mjs';

const extraisParametresDescriptionService = (selecteurFormulaire) => {
  const params = parametres(selecteurFormulaire);
  listesAvecItemsExtraits.forEach(
    ({ cle, sourceRegExpParamsItem }) => (
      modifieParametresAvecItemsExtraits(params, cle, sourceRegExpParamsItem)
    )
  );
  return params;
};

export default extraisParametresDescriptionService;
