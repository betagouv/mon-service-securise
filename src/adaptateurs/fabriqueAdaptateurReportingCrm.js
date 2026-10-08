import { AdaptateurReportingCrmTwentyRest } from './adaptateurReportingCrm.twentyRest.js';
import * as environnement from './adaptateurEnvironnement.js';

export const fabriqueAdaptateurReportingCrm = () =>
  new AdaptateurReportingCrmTwentyRest(
    environnement.crm().cleApi(),
    environnement.crm().urlBase()
  );
