import listesAvecItemsExtraits from './listesAvecItemsExtraits.mjs';
import parametres, {
  modifieParametresAvecItemsExtraits,
} from './parametres.mjs';

const extraisParametresDescriptionService = (
  selecteurFormulaire,
  pourEstimationNiveauSecurite = false
) => {
  const idFormulaires = $.map(
    $('form', selecteurFormulaire),
    (formulaire) => formulaire.id
  );
  const params = idFormulaires.reduce(
    (acc, idFormulaire) => ({ ...acc, ...parametres(`#${idFormulaire}`) }),
    {}
  );

  listesAvecItemsExtraits.forEach(({ cle, sourceRegExpParamsItem }) =>
    modifieParametresAvecItemsExtraits(params, cle, sourceRegExpParamsItem)
  );

  params.organisationResponsable = { siret: params.siretEntite };

  // Exclut les valeurs vides qui arrivent si un champ vide est placé
  // avant un champ rempli
  params.fonctionnalitesSpecifiques =
    params.fonctionnalitesSpecifiques.filter(Boolean);
  params.donneesSensiblesSpecifiques =
    params.donneesSensiblesSpecifiques.filter(Boolean);
  params.pointsAcces = params.donneesSensiblesSpecifiques.filter(Boolean);

  delete params.siretEntite;
  delete params.nomEntite;
  delete params.departementEntite;
  delete params['siretEntite-selectize'];
  delete params['departementEntite-selectize'];

  if (pourEstimationNiveauSecurite) delete params.niveauSecurite;

  if (
    pourEstimationNiveauSecurite &&
    !params.nombreOrganisationsUtilisatrices
  ) {
    params.nombreOrganisationsUtilisatrices = { borneBasse: 0, borneHaute: 0 };
  } else {
    const [borneBasse, borneHaute] =
      params.nombreOrganisationsUtilisatrices.split('-');
    params.nombreOrganisationsUtilisatrices = { borneBasse, borneHaute };
  }

  return params;
};

export default extraisParametresDescriptionService;
