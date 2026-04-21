export type DonneesIndiceCyber = {
  total: number;
  gouvernance: number;
  protection: number;
  defense: number;
  resilience: number;
};

type ValeurTrancheIndiceCyber = {
  borneInferieure: number;
  borneSuperieure: number;
  conseilHomologation: string;
  deconseillee: boolean;
  description: string;
  dureeHomologationConseillee: string;
  recommandationANSSI: string;
  recommandationANSSIComplement: string;
};

type DescriptionTrancheIndiceCyber = {
  description: string;
  trancheCourante: boolean;
};

export type Tranches = {
  valeurs: ValeurTrancheIndiceCyber;
  descriptions: Array<DescriptionTrancheIndiceCyber>;
};

export type IndicesCyber = {
  indiceCyberAnssi: DonneesIndiceCyber;
  indiceCyberPersonnalise: DonneesIndiceCyber;
  referentielsMesureConcernes: string;
  nombreMesuresSpecifiques: number;
  nombreMesuresNonFait: number;
  tranches: {
    indiceCyber: Tranches;
    indiceCyberPersonnalise: Tranches;
  };
};
