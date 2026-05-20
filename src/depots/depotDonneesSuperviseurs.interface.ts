import { UUID } from '../typesBasiques.js';

export type DepotDonneesSuperviseurs = {
  ajouteSiretAuSuperviseur: (
    idSuperviseur: UUID,
    siret: string
  ) => Promise<void>;
  estSuperviseur: (idUtilisateur: UUID) => Promise<boolean>;
  lisSuperviseurs: (siret: string) => Promise<UUID[]>;
  revoqueSuperviseur: (id: UUID) => Promise<void>;
};
