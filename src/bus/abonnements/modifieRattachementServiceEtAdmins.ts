import Service from '../../modeles/service.js';
import DescriptionService from '../../modeles/descriptionService.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';
import { ServiceAdministrationOrganisations } from '../../supervision/serviceAdministrationOrganisations.js';

function modifieRattachementServiceEtAdmins({
  serviceAdministrationOrganisations,
}: {
  serviceAdministrationOrganisations: ServiceAdministrationOrganisations;
}) {
  return async ({
    service,
    ancienneDescription,
  }: {
    service: Service;
    ancienneDescription: DescriptionService | DescriptionServiceV2;
  }) => {
    if (
      service.siretDeOrganisation() ===
      ancienneDescription.organisationResponsable.siret
    )
      return;
    await serviceAdministrationOrganisations.rattacheLesAdministrateursDe(
      service
    );
  };
}

export { modifieRattachementServiceEtAdmins };
