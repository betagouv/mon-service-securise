import * as environnement from './adaptateurEnvironnement.js';
import { AdaptateurReportingCrmTwentyRest } from './reportingCrm/adaptateurReportingCrm.twentyRest.js';
import { AdaptateurReportingCrmMemoire } from './reportingCrm/adaptateurReportingCrm.memoire.js';

export const fabriqueAdaptateurReportingCrm = () =>
  environnement.crm().estActif()
    ? new AdaptateurReportingCrmTwentyRest(
        environnement.crm().cleApi(),
        environnement.crm().urlBase()
      )
    : new AdaptateurReportingCrmMemoire();
