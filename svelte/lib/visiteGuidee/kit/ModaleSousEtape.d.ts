export type PositionModale =
  | 'MilieuDroite'
  | 'HautDroite'
  | 'BasDroite'
  | 'MilieuGauche'
  | 'HautGauche'
  | 'BasGauche'
  | 'BasMilieu'
  | 'DeuxTiersCentre';

export type SousEtape = {
  cible: HTMLElement;
  callbackInitialeCible?: (cible: HTMLElement) => void;
  callbackFinaleCible?: (cible: HTMLElement) => void;
  delaiAvantAffichage?: number;
  margeElementMisEnAvant?: number;
  margesElementMisEnAvant?: string; // sous la forme "10 23 12 0" pour haut droite bas gauche
  positionnementModale: PositionModale;
  titre: string;
  description: string;
  animation?: string;
  texteBoutonDerniereEtape?: string;
};

export type PositionRond = 'Droite' | 'Gauche' | 'Bas' | 'DeuxTiersCentre';
