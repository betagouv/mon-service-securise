import { ReportingWebhookMattermost } from './adaptateurReporting.webhookMattermost.js';

export interface Reporting {
  envoie(rapport: string[]): Promise<void>;
}

export function fabriqueReporting(): Reporting {
  return new ReportingWebhookMattermost();
}
