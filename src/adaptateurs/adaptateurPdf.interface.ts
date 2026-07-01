export type DonneesPdfSyntheseSecurite = {
  nomService: string;
};

export interface AdaptateurPdf {
  genereSyntheseSecurite: (
    donnees: DonneesPdfSyntheseSecurite
  ) => Promise<Buffer<ArrayBuffer>>;
}
