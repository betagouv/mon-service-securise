import Service from '../modeles/service.js';
import { VersionService } from '../modeles/versionService.js';
import { DonneesPourAnnexeDescriptionDeServiceV2 } from '../modeles/objetsPDF/objetPDFAnnexeDescriptionV2.js';
import { DonneesPdfDossierDecision } from './adaptateurPdf.typst.js';

export type DonneesPourAnnexeDescriptionDeServiceV1 = {
  nomService: string;
  versionService: VersionService;
  fonctionnalites: string[];
  donneesStockees: string[];
  dureeDysfonctionnementMaximumAcceptable: string;
};

export type DonneesPdfAnnexes = {
  donneesDescription:
    | {
        versionService: VersionService.v1 &
          DonneesPourAnnexeDescriptionDeServiceV1;
      }
    | {
        versionService: VersionService.v2 &
          DonneesPourAnnexeDescriptionDeServiceV2;
      };
};

export interface AdaptateurPdf {
  genereSyntheseSecurite: (donnees: {
    service: Service;
  }) => Promise<Buffer<ArrayBuffer>>;
  genereDossierDecision: (
    donnees: DonneesPdfDossierDecision
  ) => Promise<Buffer<ArrayBuffer>>;

  genereAnnexes: (donnees: DonneesPdfAnnexes) => Promise<Buffer<ArrayBuffer>>;
}
