/* eslint-disable no-restricted-syntax, class-methods-use-this, no-empty-function */

import {
  Ajoute,
  ConfigurationSelectionObjectifsVises,
  IdObjectifVise,
  ReglePourObjectifVise,
  ReglesDeSelectionObjectifVise,
} from './selectionObjectifsVises.types.js';
import { DescriptionServiceV2 } from '../../modeles/descriptionServiceV2.js';

export class SelectionObjectifsVises {
  constructor(
    private readonly configuration: ConfigurationSelectionObjectifsVises
  ) {}

  selectionnePourService(service: DescriptionServiceV2): Array<IdObjectifVise> {
    const objectifsVisesRetenus: Array<IdObjectifVise> = [];

    for (const [idObjectif, objectifVise] of this.tousLesObjectifs()) {
      const choix = new Set<Ajoute>();

      if (objectifVise.presentInitialement) choix.add('Ajouter');

      for (const cle of this.enumereRegles(objectifVise)) {
        const regle = objectifVise.regles[cle];

        for (const modificateur of this.enumereModificateurs(regle)) {
          const ordre = regle![modificateur];
          const serviceEstConcerne =
            (Array.isArray(service[cle]) &&
              service[cle].includes(modificateur)) ||
            service[cle] === modificateur;

          if (ordre && serviceEstConcerne) {
            if (ordre === 'Ajouter') choix.add('Ajouter');
          }
        }
      }

      if (choix.has('Ajouter')) objectifsVisesRetenus.push(idObjectif);
    }

    return objectifsVisesRetenus;
  }

  private tousLesObjectifs() {
    return Object.entries(this.configuration) as Array<
      [IdObjectifVise, ReglePourObjectifVise]
    >;
  }

  private enumereModificateurs(
    regle: ReglesDeSelectionObjectifVise[keyof ReglesDeSelectionObjectifVise]
  ) {
    return Object.keys(regle!) as (keyof typeof regle)[];
  }

  private enumereRegles(vecteur: { regles: ReglesDeSelectionObjectifVise }) {
    return Object.keys(vecteur.regles) as Array<
      keyof ReglesDeSelectionObjectifVise
    >;
  }
}
