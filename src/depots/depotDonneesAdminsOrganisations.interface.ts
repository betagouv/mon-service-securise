import { UUID } from '../typesBasiques.js';
import Entite from '../modeles/entite.js';
import Utilisateur from '../modeles/utilisateur.js';

export type DepotDonneesAdminsOrganisations = {
  lisAdminsPour: (siret: string) => Promise<Array<UUID>>;
  entitesAdministreesPar: (idUtilisateur: UUID) => Promise<Array<Entite>>;
  utilisateursAdministresPar: (
    idUtilisateur: UUID
  ) => Promise<Array<Utilisateur>>;
  ajouteSiretAAdmin: (idUtilisateur: UUID, siret: string) => Promise<void>;
};
