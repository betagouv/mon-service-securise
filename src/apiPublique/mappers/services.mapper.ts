import Service from '../../modeles/service.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { ServiceApiPublique } from '../schemas/services.schema.js';

const { DROITS_VOIR_DESCRIPTION } = Autorisation;

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
    ...(peutVoirLaDescription && { niveauSecurite }),
  };
};
