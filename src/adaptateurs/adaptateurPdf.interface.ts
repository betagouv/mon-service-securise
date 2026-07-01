export type DonneesPdfSyntheseSecurite = {
  nomService: string;
  nomEntite: string;
};

export interface AdaptateurPdf {
  genereSyntheseSecurite: (
    donnees: DonneesPdfSyntheseSecurite
  ) => Promise<Buffer<ArrayBuffer>>;
}
