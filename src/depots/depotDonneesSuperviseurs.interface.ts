import { UUID } from '../typesBasiques.js';

export type DepotDonneesSuperviseurs = {
  ajouteSiretAuSuperviseur: (
    idSuperviseur: UUID,
    siret: string
  ) => Promise<void>;
  lisSuperviseurs: (siret: string) => Promise<UUID[]>;
  revoqueSuperviseur: (id: UUID) => Promise<void>;
};
