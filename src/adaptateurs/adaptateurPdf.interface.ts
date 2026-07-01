import Service from '../modeles/service.js';

export interface AdaptateurPdf {
  genereSyntheseSecurite: (donnees: {
    service: Service;
  }) => Promise<Buffer<ArrayBuffer>>;
}
