import Service from '../../modeles/service.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';

const { DROITS_VOIR_DESCRIPTION } = Autorisation;

export const serialiseServicePourAPIPublique = (
  service: Service,
  autorisation?: Autorisation
) => {
  const { organisationResponsable, niveauSecurite } =
    service.descriptionService;
  const peutVoirLaDescription = autorisation?.aLesPermissions(
    DROITS_VOIR_DESCRIPTION
  );

  return {
    id: service.id,
    nom: service.nomService(),
    organisationResponsable: {
      nom: organisationResponsable.nom,
      siret: organisationResponsable.siret,
    },
    nombreContributeurs: service.contributeurs.length,
    ...(peutVoirLaDescription && { niveauSecurite }),
  };
};
