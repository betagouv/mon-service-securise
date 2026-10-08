import axios from 'axios';
import { AdaptateurReportingCrm } from './adaptateurReportingCrm.interface.js';
import { CrmImportEnMasse } from '../bus/abonnements/reporting-bizdev/consigneImportDeServicesDansCrm.js';
import { VersionService } from '../modeles/versionService.js';

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
    const mapping: Record<VersionService, string> = {
      [VersionService.v1]: 'SERVICE_V1',
      [VersionService.v2]: 'SERVICE_V2',
    };

    await axios.post(
      // Oui, il y a bien 2 "s" à la fin
      new URL('/rest/donneesMssImportsDeServicess', this.urlCrm).toString(),
      {
        name: data.emailUtilisateur,
        versionDeServiceImportee: mapping[data.versionServices],
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
