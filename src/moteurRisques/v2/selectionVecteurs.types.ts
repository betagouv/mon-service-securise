import {
  ActiviteExternalisee,
  DureeDysfonctionnementAcceptable,
  NiveauSecurite,
  OuvertureSysteme,
  SpecificiteProjet,
  TypeHebergement,
} from '../../../donneesReferentielMesuresV2.js';

export type IdVecteurRisque = `V${
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14}`;

export type AjouteOuRetire = 'Ajouter' | 'Retirer';

export type ReglesDeSelection = {
  activitesExternalisees?: Partial<
    Record<ActiviteExternalisee, AjouteOuRetire>
  >;
  dureeDysfonctionnementAcceptable?: Partial<
    Record<
      Extract<DureeDysfonctionnementAcceptable, 'moinsDe4h' | 'moinsDe12h'>,
      AjouteOuRetire
    >
  >;
  niveauSecurite?: Partial<
    Record<Extract<NiveauSecurite, 'niveau1' | 'niveau2'>, AjouteOuRetire>
  >;
  ouvertureSysteme?: Partial<
    Record<
      Extract<OuvertureSysteme, 'internePlusTiers' | 'accessibleSurInternet'>,
      AjouteOuRetire
    >
  >;
  specificitesProjet?: Partial<
    Record<
      Extract<
        SpecificiteProjet,
        'postesDeTravail' | 'accesPhysiqueAuxSallesTechniques'
      >,
      AjouteOuRetire
    >
  >;
  typeHebergement?: Partial<
    Record<Extract<TypeHebergement, 'cloud' | 'saas'>, AjouteOuRetire>
  >;
};

export type ReglePourVecteur = {
  presentInitialement: boolean;
  regles: ReglesDeSelection;
};

export type ConfigurationSelectionVecteurs = Record<
  IdVecteurRisque,
  ReglePourVecteur
>;
