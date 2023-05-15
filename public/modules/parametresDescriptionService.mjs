import listesAvecItemsExtraits from './listesAvecItemsExtraits.mjs';
import parametres, {
  modifieParametresAvecItemsExtraits,
} from './parametres.mjs';
import convertisReponseOuiNon from './convertisReponseOuiNon.mjs';

const extraisParametresDescriptionService = (selecteurFormulaire) => {
  const params = parametres(selecteurFormulaire);

  params.risqueJuridiqueFinancierReputationnel = convertisReponseOuiNon(
    params.risqueJuridiqueFinancierReputationnel
  );

  listesAvecItemsExtraits.forEach(({ cle, sourceRegExpParamsItem }) =>
    modifieParametresAvecItemsExtraits(params, cle, sourceRegExpParamsItem)
  );

  if (params.organisationsResponsables) {
    params.organisationsResponsables = [params.organisationsResponsables];
  }

  return params;
};

export default extraisParametresDescriptionService;
