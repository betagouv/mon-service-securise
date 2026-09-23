import Service from '../../modeles/service.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { ServiceApiPublique } from '../schemas/services.schema.js';
import { IdNiveauSecurite } from '../../referentiel.types.js';

const { DROITS_VOIR_DESCRIPTION } = Autorisation;

const besoinsSecuriteParNiveau: Record<
  IdNiveauSecurite,
  ServiceApiPublique['besoinsSecurite']
> = {
  niveau1: 'basiques',
  niveau2: 'moderes',
  niveau3: 'avances',
};

export const serialiseServicePourAPIPublique = (
  service: Service,
  autorisation?: Autorisation
): ServiceApiPublique => {
  const { organisationResponsable, niveauSecurite } =
    service.descriptionService;
  const peutVoirLaDescription = autorisation?.aLesPermissions(
    DROITS_VOIR_DESCRIPTION
  );

  return {
    id: service.id,
    nom: service.nomService(),
    organisationResponsable: {
      nom: organisationResponsable.nom ?? null,
      siret: organisationResponsable.siret ?? null,
    },
    nombreContributeurs: service.contributeurs.length,
    ...(peutVoirLaDescription && {
      besoinsSecurite:
        besoinsSecuriteParNiveau[niveauSecurite as IdNiveauSecurite],
    }),
  };
};
