import { UUID } from '../typesBasiques.js';
import Entite from '../modeles/entite.js';

export type DepotDonneesAdministrationOrganisations = {
  lisAdminsPour: (siret: string) => Promise<Array<UUID>>;
  entitesAdministreesPar: (idUtilisateur: UUID) => Promise<Array<Entite>>;
  ajouteSiretAAdmin: (idUtilisateur: UUID, siret: string) => Promise<void>;
};
