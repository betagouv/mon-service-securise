import { ServiceStatistiquesAdmin } from './serviceStatistiquesAdmin.js';
import { AdaptateurChiffrement } from './adaptateurChiffrement.interface.js';
import { AdaptateurJournalMSS } from './adaptateurJournalMSS.interface.js';
import { TousReferentiels } from '../referentiel.interface.js';

export const fabriqueServiceStatistiquesAdmin = (
  adaptateurChiffrement: AdaptateurChiffrement,
  adaptateurJournalMSS: AdaptateurJournalMSS,
  referentiel: TousReferentiels
) =>
  new ServiceStatistiquesAdmin(
    adaptateurChiffrement,
    adaptateurJournalMSS,
    referentiel
  );
