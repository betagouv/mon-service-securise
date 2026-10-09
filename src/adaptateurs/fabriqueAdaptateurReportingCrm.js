import * as environnement from './adaptateurEnvironnement.js';
import { AdaptateurReportingCrmTwentyRest } from './adaptateurReportingCrm.twentyRest.js';
import { AdaptateurReportingCrmMemoire } from './adaptateurReportingCrm.memoire.js';

export const fabriqueAdaptateurReportingCrm = () =>
  environnement.crm().estActif()
    ? new AdaptateurReportingCrmTwentyRest(
        environnement.crm().cleApi(),
        environnement.crm().urlBase()
      )
    : new AdaptateurReportingCrmMemoire();
