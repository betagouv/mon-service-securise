import EvenementUtilisateurInscrit from '../../evenementUtilisateurInscrit.js';
import { AdaptateurReportingCrm } from '../../../adaptateurs/adaptateurReportingCrm.interface.js';

type Config = {
  reportingCrm: Pick<AdaptateurReportingCrm, 'consigneEntiteUtilisatrice'>;
};

export function consigneNouvelUtilisateurDansCrm({ reportingCrm }: Config) {
  return async (e: EvenementUtilisateurInscrit) => {
    await reportingCrm.consigneEntiteUtilisatrice(e.utilisateur.entite);
  };
}
