import listesAvecItemsExtraits from './listesAvecItemsExtraits.mjs';
import parametres, {
  modifieParametresAvecItemsExtraits,
} from './parametres.mjs';

const extraisParametresDescriptionService = (selecteurFormulaire) => {
  const idFormulaires = $.map(
    $('form', selecteurFormulaire),
    (formulaire) => formulaire.id
  );
  const params = idFormulaires.reduce(
    (acc, idFormulaire) => ({
      ...acc,
      ...parametres(`#${idFormulaire}`),
    }),
    {}
  );

  listesAvecItemsExtraits.forEach(({ cle, sourceRegExpParamsItem }) =>
    modifieParametresAvecItemsExtraits(params, cle, sourceRegExpParamsItem)
  );

  params.organisationResponsable = {
    siret: params.siretEntite,
  };

  delete params.siretEntite;
  delete params.nomEntite;
  delete params.departementEntite;
  delete params['siretEntite-selectize'];
  delete params['departementEntite-selectize'];

  const [borneBasse, borneHaute] =
    params.nombreOrganisationsUtilisatrices.split('-');
  params.nombreOrganisationsUtilisatrices = { borneBasse, borneHaute };

  return params;
};

export default extraisParametresDescriptionService;
