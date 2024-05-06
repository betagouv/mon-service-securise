export type PositionModale =
  | 'MilieuDroite'
  | 'HautDroite'
  | 'BasDroite'
  | 'MilieuGauche'
  | 'HautGauche'
  | 'BasGauche'
  | 'BasMilieu';

export type SousEtape = {
  cible: HTMLElement;
  callbackInitialeCible?: (cible: HTMLElement) => void;
  callbackFinaleCible?: (cible: HTMLElement) => void;
  delaiAvantAffichage?: number;
  avecTrouRideauColle?: boolean;
  positionnementModale: PositionModale;
  titre: string;
  description: string;
  animation?: string;
  texteBoutonDerniereEtape?: string;
};

export type PositionRond = 'Droite' | 'Gauche' | 'Bas';
