import Service from '../modeles/service.js';
import { DonneesPdfDossierDecision } from './adaptateurPdf.typst.js';

export interface AdaptateurPdf {
  genereSyntheseSecurite: (donnees: {
    service: Service;
  }) => Promise<Buffer<ArrayBuffer>>;
  genereDossierDecision: (
    donnees: DonneesPdfDossierDecision
  ) => Promise<Buffer<ArrayBuffer>>;
}
