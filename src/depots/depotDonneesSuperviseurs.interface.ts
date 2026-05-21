import { UUID } from '../typesBasiques.js';

export type DepotDonneesSuperviseurs = {
  ajouteSiretAuSuperviseur: (
    idSuperviseur: UUID,
    siret: string
  ) => Promise<void>;
  revoqueSuperviseur: (id: UUID) => Promise<void>;
};
