import { DepotDonnees } from '../depotDonnees.interface.js';
import { AdaptateurStatistiquesAdmin } from './adaptateurStatistiquesAdmin.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { AdaptateurJournalMSS } from './adaptateurJournalMSS.interface.js';

export const fabriqueAdaptateurStatistiquesAdmin = (
  depotDonnees: DepotDonnees,
  adaptateurChiffrement: AdaptateurChiffrement,
  adaptateurJournalMSS: AdaptateurJournalMSS
) =>
  new AdaptateurStatistiquesAdmin(
    { servicesDeUtilisateur: depotDonnees.services },
    adaptateurChiffrement,
    adaptateurJournalMSS
  );
