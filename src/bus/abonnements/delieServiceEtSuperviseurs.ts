import ServiceSupervision from '../../supervision/serviceSupervision.js';
import { UUID } from '../../typesBasiques.js';

function delieServiceEtSuperviseurs({
  serviceSupervision,
}: {
  serviceSupervision: ServiceSupervision;
}) {
  return async ({ idService }: { idService: UUID }) => {
    await serviceSupervision.delieServiceEtSuperviseurs(idService);
  };
}

export { delieServiceEtSuperviseurs };
