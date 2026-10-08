import { VersionService } from '../../../modeles/versionService.js';
import { UUID } from '../../../typesBasiques.js';
import Utilisateur from '../../../modeles/utilisateur.js';
import EvenementServicesImportes from '../../evenementServicesImportes.js';

type Config = {
  reportingCrm: {
    consigneImportEnMasse: (data: CrmImportEnMasse) => Promise<void>;
  };
  depotDonnees: {
    utilisateur: (idUtilisateur: UUID) => Promise<Utilisateur>;
  };
};

export type CrmImportEnMasse = {
  emailUtilisateur: string;
  nbServices: number;
  versionServices: VersionService;
};

export function consigneImportDeServicesDansCrm({
  depotDonnees,
  reportingCrm,
}: Config) {
  return async (e: EvenementServicesImportes) => {
    const utilisateur = await depotDonnees.utilisateur(e.idUtilisateur);

    await reportingCrm.consigneImportEnMasse({
      emailUtilisateur: utilisateur.email,
      nbServices: e.nbServicesImportes,
      versionServices: e.versionServicesImportes,
    });
  };
}
