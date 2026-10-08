import { CrmImportEnMasse } from '../bus/abonnements/reporting-bizdev/consigneImportDeServicesDansCrm.js';

export interface AdaptateurReportingCrm {
  consigneImportEnMasse: (data: CrmImportEnMasse) => Promise<void>;
}
