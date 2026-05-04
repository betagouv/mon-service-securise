import Service from '../../modeles/service.js';
import { ServiceAdministrationOrganisations } from '../../supervision/serviceAdministrationOrganisations.js';

function rattacheServiceEtAdmins({
  serviceAdministrationOrganisations,
}: {
  serviceAdministrationOrganisations: ServiceAdministrationOrganisations;
}) {
  return async ({ service }: { service: Service }) => {
    await serviceAdministrationOrganisations.rattacheLesAdministrateursDe(
      service
    );
  };
}

export { rattacheServiceEtAdmins };
