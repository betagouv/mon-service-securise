import { EvenementNouveauServiceCree } from '../../evenementNouveauServiceCree.js';
import EvenementServiceSupprime from '../../evenementServiceSupprime.js';
import { AdaptateurReportingCrm } from '../../../adaptateurs/reportingCrm/adaptateurReportingCrm.interface.js';

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
  const siretConcerne = (
    e: EvenementNouveauServiceCree | EvenementServiceSupprime
  ) =>
    e instanceof EvenementNouveauServiceCree
      ? e.service.siretDeOrganisation()
      : e.siret;

  return async (
    evenement: EvenementNouveauServiceCree | EvenementServiceSupprime
  ) => {
    const siret = siretConcerne(evenement);
    if (!siret) return;

    const denombrements =
      await depotDonnees.denombreServicesEtUtilisateursParSiret([siret]);
    const { nombreServices } = denombrements.get(siret)!;

    await reportingCrm.consigneNombreDeServicesDeLEntite(siret, nombreServices);
  };
}
