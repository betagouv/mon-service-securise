import EvenementUtilisateurInscrit from '../../evenementUtilisateurInscrit.js';
import { AdaptateurReportingCrm } from '../../../adaptateurs/adaptateurReportingCrm.interface.js';

type Config = {
  reportingCrm: Pick<
    AdaptateurReportingCrm,
    'consigneEntiteUtilisatrice' | 'consigneUtilisateur'
  >;
};

export function consigneNouvelUtilisateurDansCrm({ reportingCrm }: Config) {
  return async ({ utilisateur }: EvenementUtilisateurInscrit) => {
    const idEntite = await reportingCrm.consigneEntiteUtilisatrice(
      utilisateur.entite
    );
    await reportingCrm.consigneUtilisateur(utilisateur.email, idEntite);
  };
}
