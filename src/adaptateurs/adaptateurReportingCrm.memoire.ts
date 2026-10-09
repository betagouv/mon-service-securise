import { AdaptateurReportingCrm } from './adaptateurReportingCrm.interface.js';
import { CrmImportEnMasse } from '../bus/abonnements/reporting-bizdev/consigneImportDeServicesDansCrm.js';

/* eslint-disable no-console */

export class AdaptateurReportingCrmMemoire implements AdaptateurReportingCrm {
  // eslint-disable-next-line class-methods-use-this
  async consigneImportEnMasse(data: CrmImportEnMasse): Promise<void> {
    console.log('📝 [REPORTING CRM] Import en masse');
    console.dir(data);
  }
}
