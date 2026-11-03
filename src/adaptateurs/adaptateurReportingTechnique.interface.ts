import { ReportingTechniqueWebhookMattermost } from './adaptateurReportingTechnique.webhookMattermost.js';
import { reportingTechnique } from './adaptateurEnvironnement.js';
import { ReportingTechniqueConsole } from './adaptateurReportingTechnique.console.js';

export interface ReportingTechnique {
  envoie(rapport: string[]): Promise<void>;
}

export function fabriqueReportingTechnique(): ReportingTechnique {
  if (reportingTechnique().typeActif() === 'MATTERMOST') {
    return new ReportingTechniqueWebhookMattermost();
  }
  return new ReportingTechniqueConsole();
}
