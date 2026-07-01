export interface AdaptateurPdf {
  genereSyntheseSecurite: () => Promise<Buffer<ArrayBuffer>>;
}
