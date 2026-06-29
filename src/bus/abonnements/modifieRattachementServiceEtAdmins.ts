import Service from '../../modeles/service.js';
import DescriptionService from '../../modeles/descriptionService.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { ServiceAdministrationOrganisations } from '../../supervision/serviceAdministrationOrganisations.js';
import Utilisateur from '../../modeles/utilisateur.js';

function modifieRattachementServiceEtAdmins({
  serviceAdministrationOrganisations,
}: {
  serviceAdministrationOrganisations: ServiceAdministrationOrganisations;
}) {
  return async ({
    service,
    ancienneDescription,
    utilisateur,
  }: {
    service: Service;
    ancienneDescription: DescriptionService | DescriptionServiceV2;
    utilisateur: Utilisateur;
  }) => {
    if (
      service.siretDeOrganisation() ===
      ancienneDescription.organisationResponsable.siret
    )
      return;
    await serviceAdministrationOrganisations.rattacheLesAdministrateursDe(
      utilisateur.id,
      service
    );
  };
}

export { modifieRattachementServiceEtAdmins };
