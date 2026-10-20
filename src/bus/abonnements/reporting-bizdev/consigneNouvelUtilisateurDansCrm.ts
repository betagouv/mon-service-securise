import EvenementUtilisateurInscrit from '../../evenementUtilisateurInscrit.js';
import { AdaptateurReportingCrm } from '../../../adaptateurs/reportingCrm/adaptateurReportingCrm.interface.js';

type Config = {
  reportingCrm: Pick<
    AdaptateurReportingCrm,
    'consigneEntiteUtilisatrice' | 'consigneUtilisateur'
  >;
};

export function consigneNouvelUtilisateurDansCrm({ reportingCrm }: Config) {
  return async ({ utilisateur }: EvenementUtilisateurInscrit) => {
    const aUnSiret = !!utilisateur.entite?.siret;
    const idEntite = aUnSiret
      ? await reportingCrm.consigneEntiteUtilisatrice(utilisateur.entite)
      : undefined;
    await reportingCrm.consigneUtilisateur(utilisateur.email, idEntite);
  };
}
