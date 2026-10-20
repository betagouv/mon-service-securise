import EvenementDossierHomologationFinalise from '../../evenementDossierHomologationFinalise.js';
import EvenementDossierHomologationImporte from '../../evenementDossierHomologationImporte.js';
import { AdaptateurReportingCrm } from '../../../adaptateurs/reportingCrm/adaptateurReportingCrm.interface.js';
import Service from '../../../modeles/service.js';
import { UUID } from '../../../typesBasiques.js';

type Config = {
  reportingCrm: Pick<
    AdaptateurReportingCrm,
    'consigneNombreDHomologationsDeLEntite'
  >;
  depotDonnees: {
    service: (idService: UUID) => Promise<Service>;
    tousLesServicesAvecSiret: (siret: string) => Promise<Service[]>;
  };
};

export function metAJourNombreDHomologationsDeLEntiteDansCrm({
  reportingCrm,
  depotDonnees,
}: Config) {
  return async ({
    idService,
  }:
    | EvenementDossierHomologationFinalise
    | EvenementDossierHomologationImporte) => {
    const service = await depotDonnees.service(idService);
    const siret = service.siretDeOrganisation();
    if (!siret) return;

    const servicesDeLEntite =
      await depotDonnees.tousLesServicesAvecSiret(siret);
    const nombreDHomologations = servicesDeLEntite.reduce(
      (total, s) => total + s.nombreDossiers(),
      0
    );

    await reportingCrm.consigneNombreDHomologationsDeLEntite(
      siret,
      nombreDHomologations
    );
  };
}
