export type DonneesSupportCommissionHomologation = {
  nomService: string;
  dateCreation: Date;
};

export interface AdaptateurPowerpoint {
  genereSupportCommissionHomologation: (
    donnees: DonneesSupportCommissionHomologation
  ) => Promise<Buffer>;
}
