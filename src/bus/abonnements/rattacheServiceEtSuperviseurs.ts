import Service from '../../modeles/service.js';
import { ServiceAdministrationOrganisations } from '../../supervision/serviceAdministrationOrganisations.js';

function rattacheServiceEtSuperviseurs({
  serviceAdministrationOrganisations,
}: {
  serviceAdministrationOrganisations: ServiceAdministrationOrganisations;
}) {
  return async ({ service }: { service: Service }) => {
    await serviceAdministrationOrganisations.rattacheLesSuperviseursDe(service);
  };
}

export { rattacheServiceEtSuperviseurs };
