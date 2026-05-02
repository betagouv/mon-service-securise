import * as depotDonneesSuperviseur from './depotDonneesSuperviseurs.js';

export type DepotDonneesSuperviseurs = ReturnType<
  typeof depotDonneesSuperviseur.creeDepot
>;
