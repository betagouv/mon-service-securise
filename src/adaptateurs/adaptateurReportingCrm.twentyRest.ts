import axios from 'axios';
import { AdaptateurReportingCrm } from './adaptateurReportingCrm.interface.js';
import { CrmImportEnMasse } from '../bus/abonnements/reporting-bizdev/consigneImportDeServicesDansCrm.js';

export class AdaptateurReportingCrmTwentyRest implements AdaptateurReportingCrm {
  constructor(
    private readonly cleApi: string,
    private readonly urlCrm: URL
  ) {
    if (!cleApi) {
      throw new Error("Impossible de démarrer sans clé d'API du CRM Twenty");
    }
    if (!urlCrm) {
      throw new Error("Impossible de démarrer sans l'URL du CRM Twenty");
    }
  }

  async consigneImportEnMasse(data: CrmImportEnMasse): Promise<void> {
    await axios.post(
      // Oui, il y a bien 2 "s" à la fin
      new URL('/rest/donneesMssImportsDeServicess', this.urlCrm).toString(),
      {
        name: data.emailUtilisateur,
        nombreDeServices: data.nbServices,
      },
      {
        headers: {
          Authorization: `Bearer ${this.cleApi}`,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
