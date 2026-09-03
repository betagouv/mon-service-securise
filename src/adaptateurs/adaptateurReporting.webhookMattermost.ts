import axios from 'axios';
import { Reporting } from './adaptateurReporting.interface.js';
import { mattermost } from './adaptateurEnvironnement.js';

export class ReportingWebhookMattermost implements Reporting {
  private readonly urlWebhookReporting: URL;

  constructor() {
    this.urlWebhookReporting = mattermost().urlWebhookCanalReporting();
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
