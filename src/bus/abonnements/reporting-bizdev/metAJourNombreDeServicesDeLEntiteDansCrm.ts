import { EvenementNouveauServiceCree } from '../../evenementNouveauServiceCree.js';
import { AdaptateurReportingCrm } from '../../../adaptateurs/adaptateurReportingCrm.interface.js';

type Denombrement = { nombreServices: number; nombreUtilisateurs: number };

type Config = {
  reportingCrm: Pick<
    AdaptateurReportingCrm,
    'consigneNombreDeServicesDeLEntite'
  >;
  depotDonnees: {
    denombreServicesEtUtilisateursParSiret: (
      sirets: string[]
    ) => Promise<Map<string, Denombrement>>;
  };
};

export function metAJourNombreDeServicesDeLEntiteDansCrm({
  reportingCrm,
  depotDonnees,
}: Config) {
  return async ({ service }: EvenementNouveauServiceCree) => {
    const siret = service.siretDeOrganisation();
    if (!siret) return;

    const denombrements =
      await depotDonnees.denombreServicesEtUtilisateursParSiret([siret]);
    const { nombreServices } = denombrements.get(siret)!;

    await reportingCrm.consigneNombreDeServicesDeLEntite(siret, nombreServices);
  };
}
