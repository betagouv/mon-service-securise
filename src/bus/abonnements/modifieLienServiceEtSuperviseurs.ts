import ServiceSupervision from '../../supervision/serviceSupervision.js';
import Service from '../../modeles/service.js';
import DescriptionService from '../../modeles/descriptionService.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';

function modifieLienServiceEtSuperviseurs({
  serviceSupervision,
}: {
  serviceSupervision: ServiceSupervision;
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
    await serviceSupervision.modifieLienServiceEtSuperviseurs(service);
  };
}

export { modifieLienServiceEtSuperviseurs };
