import { ReportingTechnique } from './adaptateurReportingTechnique.interface.js';
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */

export class ReportingTechniqueConsole implements ReportingTechnique {
  async envoie(rapport: string[]): Promise<void> {
    console.log('🗒️ Reporting technique :');
    console.log(rapport);
  }
}
