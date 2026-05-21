import { UUID } from '../typesBasiques.js';

export type DepotDonneesSuperviseurs = {
  revoqueSuperviseur: (id: UUID) => Promise<void>;
};
