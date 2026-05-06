import { UUID } from '../typesBasiques.js';
import Entite from '../modeles/entite.js';

export type DepotDonneesAdministrationOrganisationsInterface = {
  lisAdminsPour: (siret: string) => Promise<Array<UUID>>;
  entitesDansPerimetreDe: (idUtilisateur: UUID) => Promise<Array<Entite>>;
};
