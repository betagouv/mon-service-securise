export type DonneesPdfSyntheseSecurite = {
  nomService: string;
  nomEntite: string;
  typeService: string;
  localisationDonnees: string;
  statutDeploiement: string;
  presentation: string;
  niveauSecurite: string;
  labelNiveauSecurite: string;
  niveauSuperieurAuxRecommandations: boolean;
  labelNiveauRecommande: string;
};

export interface AdaptateurPdf {
  genereSyntheseSecurite: (
    donnees: DonneesPdfSyntheseSecurite
  ) => Promise<Buffer<ArrayBuffer>>;
}
