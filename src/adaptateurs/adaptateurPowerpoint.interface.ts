export type DonneesSupportCommissionHomologation = {
  dateCreation: Date;
};

export interface AdaptateurPowerpoint {
  genereSupportCommissionHomologation: (
    donnees: DonneesSupportCommissionHomologation
  ) => Promise<Buffer>;
}
