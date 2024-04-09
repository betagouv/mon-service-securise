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

  if (params.organisationResponsable) {
    params.organisationResponsable = [params.organisationResponsable];
  }

  const [borneBasse, borneHaute] =
    params.nombreOrganisationsUtilisatrices.split('-');
  params.nombreOrganisationsUtilisatrices = { borneBasse, borneHaute };

  return params;
};

export default extraisParametresDescriptionService;
