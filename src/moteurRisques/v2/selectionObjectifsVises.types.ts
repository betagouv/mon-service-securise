import {
  SpecificiteProjet,
  TypeDeService,
} from '../../../donneesReferentielMesuresV2.js';

export type IdObjectifVise = `OV${1 | 2 | 3 | 4}`;

export type Ajoute = 'Ajouter';

export type ReglesDeSelectionObjectifVise = {
  typeService?: Partial<
    Record<
      Extract<TypeDeService, 'portailInformation' | 'serviceEnLigne'>,
      Ajoute
    >
  >;
  specificitesProjet?: Partial<
    Record<Extract<SpecificiteProjet, 'echangeOuReceptionEmails'>, Ajoute>
  >;
};

export type ReglePourObjectifVise = {
  presentInitialement: boolean;
  regles: ReglesDeSelectionObjectifVise;
};

export type ConfigurationSelectionObjectifsVises = Record<
  IdObjectifVise,
  ReglePourObjectifVise
>;
