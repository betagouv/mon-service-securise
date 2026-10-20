import { EvenementAutorisationsServiceModifiees } from '../../evenementAutorisationsServiceModifiees.js';
import EvenementServiceSupprime from '../../evenementServiceSupprime.js';
import { EvenementNouveauServiceCree } from '../../evenementNouveauServiceCree.js';
import { AdaptateurReportingCrm } from '../../../adaptateurs/reportingCrm/adaptateurReportingCrm.interface.js';
import { fabriqueAdaptateurGestionErreur } from '../../../adaptateurs/fabriqueAdaptateurGestionErreur.js';
import { Autorisation } from '../../../modeles/autorisations/autorisation.js';
import Utilisateur from '../../../modeles/utilisateur.js';
import { UUID } from '../../../typesBasiques.js';

type EvenementConcerne =
  | EvenementAutorisationsServiceModifiees
  | EvenementServiceSupprime
  | EvenementNouveauServiceCree;

type Config = {
  reportingCrm: Pick<
    AdaptateurReportingCrm,
    'consigneNombreDeServicesEnProprietaire'
  >;
  depotDonnees: {
    utilisateur: (idUtilisateur: UUID) => Promise<Utilisateur>;
    autorisations: (idUtilisateur: UUID) => Promise<Autorisation[]>;
  };
};

export function metAJourNombreDeServicesEnProprietaireDansCrm({
  reportingCrm,
  depotDonnees,
}: Config) {
  const idsUtilisateursConcernes = (e: EvenementConcerne): UUID[] =>
    e instanceof EvenementNouveauServiceCree
      ? [e.utilisateur.id]
      : e.autorisations.map(({ idUtilisateur }) => idUtilisateur);

  const consigneLeNombreDeServicesEnProprietaire = async (
    idUtilisateur: UUID
  ) => {
    const utilisateur = await depotDonnees.utilisateur(idUtilisateur);
    const sesAutorisations = await depotDonnees.autorisations(idUtilisateur);
    const enProprietaire = sesAutorisations.filter(
      (a) => a.estProprietaire
    ).length;

    await reportingCrm.consigneNombreDeServicesEnProprietaire(
      utilisateur.email,
      enProprietaire
    );
  };

  return async (evenement: EvenementConcerne) => {
    const rapportExecution = await Promise.allSettled(
      idsUtilisateursConcernes(evenement).map(
        consigneLeNombreDeServicesEnProprietaire
      )
    );

    rapportExecution
      .filter((r) => r.status === 'rejected')
      .forEach((r) =>
        fabriqueAdaptateurGestionErreur().logueErreur(new Error(r.reason))
      );
  };
}
