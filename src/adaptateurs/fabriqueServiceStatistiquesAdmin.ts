import { DepotDonnees } from '../depotDonnees.interface.js';
import { ServiceStatistiquesAdmin } from './serviceStatistiquesAdmin.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { AdaptateurJournalMSS } from './adaptateurJournalMSS.interface.js';

export const fabriqueServiceStatistiquesAdmin = (
  depotDonnees: DepotDonnees,
  adaptateurChiffrement: AdaptateurChiffrement,
  adaptateurJournalMSS: AdaptateurJournalMSS
) =>
  new ServiceStatistiquesAdmin(
    { servicesDeUtilisateur: depotDonnees.services },
    adaptateurChiffrement,
    adaptateurJournalMSS
  );
