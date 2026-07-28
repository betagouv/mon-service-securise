import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurStatistiquesAdmin } from './adaptateurStatistiquesAdmin.js';

export const fabriqueAdaptateurStatistiquesAdmin = (
  depotDonnees: DepotDonnees
) =>
  new AdaptateurStatistiquesAdmin({
    servicesDeUtilisateur: depotDonnees.services,
  });
