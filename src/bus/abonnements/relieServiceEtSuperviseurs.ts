import ServiceSupervision from '../../supervision/serviceSupervision.js';
import Service from '../../modeles/service.js';

function relieServiceEtSuperviseurs({
  serviceSupervision,
}: {
  serviceSupervision: ServiceSupervision;
}) {
  return async ({ service }: { service: Service }) => {
    await serviceSupervision.relieServiceEtSuperviseurs(service);
  };
}

export { relieServiceEtSuperviseurs };
