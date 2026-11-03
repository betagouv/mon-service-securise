import axios from 'axios';
import { ReportingTechnique } from './adaptateurReportingTechnique.interface.js';
import { reportingTechnique } from './adaptateurEnvironnement.js';

export class ReportingTechniqueWebhookMattermost implements ReportingTechnique {
  private readonly urlWebhookReporting: URL;

  constructor() {
    this.urlWebhookReporting = reportingTechnique().urlWebhookCanalReporting();
  }

  async envoie(rapport: string[]): Promise<void> {
    await axios.post(
      this.urlWebhookReporting.toString(),
      { text: rapport.join('\n') },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
        },
      }
    );
  }
}
