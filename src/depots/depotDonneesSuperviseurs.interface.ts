import { UUID } from '../typesBasiques.js';
import Superviseur from '../modeles/superviseur.js';

export type DepotDonneesSuperviseurs = {
  ajouteSiretAuSuperviseur: (
    idSuperviseur: UUID,
    siret: string
  ) => Promise<void>;
  estSuperviseur: (idUtilisateur: UUID) => Promise<boolean>;
  lisSuperviseurs: (siret: string) => Promise<UUID[]>;
  superviseur: (id: UUID) => Promise<Superviseur | undefined>;
  revoqueSuperviseur: (id: UUID) => Promise<void>;
};
