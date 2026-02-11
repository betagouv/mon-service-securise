/* eslint-disable no-restricted-syntax, class-methods-use-this, no-empty-function */

import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';

type IdVecteurRisque = `V${
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

type AjouteOuRetire = 'Ajouter' | 'Retirer';

type ReglesDeSelection = {
  niveauSecurite?: {
    niveau1?: AjouteOuRetire;
    niveau2?: AjouteOuRetire;
  };
  specificitesProjet?: { postesDeTravail?: AjouteOuRetire };
};

type ReglePourVecteur = {
  presentInitialement: boolean;
  regles: ReglesDeSelection;
};

export type ConfigurationSelectionVecteurs = Record<
  IdVecteurRisque,
  ReglePourVecteur
>;

export class SelectionVecteurs {
  constructor(private readonly configuration: ConfigurationSelectionVecteurs) {}

  selectionnePourService(service: DescriptionServiceV2) {
    const vecteursRetenus = [];

    for (const [idVecteur, vecteur] of this.tousLesVecteurs()) {
      const choix = new Set<AjouteOuRetire>();

      if (vecteur.presentInitialement) choix.add('Ajouter');

      for (const cle of this.enumereRegles(vecteur)) {
        const regle = vecteur.regles[cle];

        for (const modificateur of this.enumereModificateurs(regle)) {
          const ordre = regle![modificateur];
          const serviceEstConcerne =
            (Array.isArray(service[cle]) &&
              service[cle].includes(modificateur)) ||
            service[cle] === modificateur;

          if (ordre && serviceEstConcerne) {
            if (ordre === 'Ajouter') choix.add('Ajouter');
            if (ordre === 'Retirer') choix.add('Retirer');
          }
        }
      }

      if (choix.has('Ajouter') && !choix.has('Retirer'))
        vecteursRetenus.push(idVecteur);
    }

    return vecteursRetenus;
  }

  private tousLesVecteurs() {
    return Object.entries(this.configuration) as Array<
      [IdVecteurRisque, ReglePourVecteur]
    >;
  }

  private enumereModificateurs(
    regle: ReglesDeSelection[keyof ReglesDeSelection]
  ) {
    return Object.keys(regle!) as (keyof typeof regle)[];
  }

  private enumereRegles(vecteur: { regles: ReglesDeSelection }) {
    return Object.keys(vecteur.regles) as Array<keyof ReglesDeSelection>;
  }
}
