export type DonneesIndiceCyber = {
  total: number;
  gouvernance: number;
  protection: number;
  defense: number;
  resilience: number;
};

export type IndicesCyber = {
  indiceCyberAnssi: DonneesIndiceCyber;
  indiceCyberPersonnalise: DonneesIndiceCyber;
  referentielsMesureConcernes: string;
  nombreMesuresSpecifiques: number;
  nombreMesuresNonFait: number;
};
