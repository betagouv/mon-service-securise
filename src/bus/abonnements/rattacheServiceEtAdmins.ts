import Service from '../../modeles/service.js';
import { ServiceAdministrationOrganisations } from '../../supervision/serviceAdministrationOrganisations.js';
import Utilisateur from '../../modeles/utilisateur.js';

function rattacheServiceEtAdmins({
  serviceAdministrationOrganisations,
}: {
  serviceAdministrationOrganisations: ServiceAdministrationOrganisations;
}) {
  return async ({
    service,
    utilisateur,
  }: {
    service: Service;
    utilisateur: Utilisateur;
  }) => {
    await serviceAdministrationOrganisations.rattacheLesAdministrateursDe(
      utilisateur.id,
      service
    );
  };
}

export { rattacheServiceEtAdmins };
