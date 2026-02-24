/*
   eslint class-methods-use-this:
     ["error", { "exceptMethods": ["estIndispensable", "estRecommandee"] }]
*/

import InformationsService from './informationsService.js';
import {
  ErreurEcheanceMesureInvalide,
  ErreurPrioriteMesureInvalide,
  ErreurStatutMesureInvalide,
} from '../erreurs.js';
import { Referentiel } from '../referentiel.interface.js';

export type StatutMesure = 'fait' | 'enCours' | 'nonFait' | 'aLancer';

const STATUTS: StatutMesure[] = ['fait', 'enCours', 'nonFait', 'aLancer'];

class Mesure extends InformationsService {
  estIndispensable() {
    return false;
  }

  estRecommandee() {
    return false;
  }

  static accumulateurInitialStatuts(
    statutFaitALaFin = false
  ): Record<StatutMesure, Record<string, unknown>> {
    return Mesure.statutsPossibles(statutFaitALaFin).reduce(
      (acc, s) => ({ ...acc, [s]: {} }),
      {} as Record<StatutMesure, Record<string, unknown>>
    );
  }

  static statutsPossibles(statutFaitALaFin = false) {
    if (!statutFaitALaFin) return STATUTS;

    const [statutFait, ...reste] = STATUTS;
    return [...reste, statutFait];
  }

  static statutRenseigne(statut?: string) {
    if (!statut) return false;

    return STATUTS.includes(statut as StatutMesure);
  }

  static valide(
    {
      statut,
      priorite,
      echeance,
    }: {
      statut?: string;
      priorite?: string;
      echeance?: string;
    },
    referentiel: Referentiel
  ) {
    if (statut && !this.statutsPossibles().includes(statut as StatutMesure)) {
      throw new ErreurStatutMesureInvalide(
        `Le statut "${statut}" est invalide`
      );
    }

    if (
      priorite &&
      !Object.keys(referentiel.prioritesMesures()).includes(priorite)
    ) {
      throw new ErreurPrioriteMesureInvalide(
        `La priorité "${priorite}" est invalide`
      );
    }

    if (echeance) {
      if (Number.isNaN(new Date(echeance).valueOf())) {
        throw new ErreurEcheanceMesureInvalide(
          `L'échéance "${echeance}" est invalide`
        );
      }
    }
  }

  static STATUT_FAIT: StatutMesure = 'fait';
  static STATUT_EN_COURS: StatutMesure = 'enCours';
  static STATUT_NON_FAIT: StatutMesure = 'nonFait';
  static STATUT_A_LANCER: StatutMesure = 'aLancer';
}

export default Mesure;
