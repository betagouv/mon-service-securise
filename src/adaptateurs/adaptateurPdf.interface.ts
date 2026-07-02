import Service from '../modeles/service.js';
import { VersionService } from '../modeles/versionService.js';
import { DonneesPourAnnexeDescriptionDeServiceV2 } from '../modeles/objetsPDF/objetPDFAnnexeDescriptionV2.js';
import { DonneesPdfDossierDecision } from './adaptateurPdf.typst.js';
import ObjetPDFAnnexeMesures from '../modeles/objetsPDF/objetPDFAnnexeMesures.js';
import ObjetPDFAnnexeRisques from '../modeles/objetsPDF/objetPDFAnnexeRisques.js';
import { ObjetPDFAnnexeRisquesV2 } from '../modeles/objetsPDF/objetPDFAnnexeRisquesV2.js';
import { TousReferentiels } from '../referentiel.interface.js';

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
  donneesMesures: ReturnType<ObjetPDFAnnexeMesures['donnees']>;
  donneesRisques?:
    | ReturnType<ObjetPDFAnnexeRisques['donnees']>
    | ReturnType<ObjetPDFAnnexeRisquesV2['donnees']>;
  referentiel?: TousReferentiels;
  versionPdfRisques?: 'v1' | 'v2';
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
