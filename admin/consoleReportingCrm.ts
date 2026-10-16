import { crm } from '../src/adaptateurs/adaptateurEnvironnement.js';
import { AdaptateurReportingCrmTwentyRest } from '../src/adaptateurs/adaptateurReportingCrm.twentyRest.js';

export class ConsoleReportingCrm {
  private readonly reportingCrm: AdaptateurReportingCrmTwentyRest;

  constructor() {
    this.reportingCrm = new AdaptateurReportingCrmTwentyRest(
      crm().cleApi()!,
      crm().urlBase()
    );
  }
}
