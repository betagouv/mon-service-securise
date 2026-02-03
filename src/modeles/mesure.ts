/*
   eslint class-methods-use-this:
     ["error", { "exceptMethods": ["estIndispensable", "estRecommandee"] }]
*/

import InformationsService from './informationsService.js';
import {
  ErreurStatutMesureInvalide,
  ErreurPrioriteMesureInvalide,
  ErreurEcheanceMesureInvalide,
} from '../erreurs.js';
import { Referentiel, ReferentielV2 } from '../referentiel.interface.js';
import type { PrioriteMesure, StatutMesure } from '../../referentiel.types.js';

const STATUTS = {
  STATUT_FAIT: 'fait',
  STATUT_EN_COURS: 'enCours',
  STATUT_NON_FAIT: 'nonFait',
  STATUT_A_LANCER: 'aLancer',
} as const;

const identifiantsStatuts = Object.values(STATUTS);

abstract class Mesure extends InformationsService {
  estIndispensable() {
    return false;
  }

  estRecommandee() {
    return false;
  }

  static accumulateurInitialStatuts(statutFaitALaFin = false) {
    return Mesure.statutsPossibles(statutFaitALaFin).reduce(
      (acc, s) => ({ ...acc, [s]: {} }),
      {}
    );
  }

  static statutsPossibles(statutFaitALaFin = false) {
    const resultat = Object.values(STATUTS);

    if (statutFaitALaFin) {
      const [statutFait, ...reste] = resultat;
      return [...reste, statutFait];
    }
    return resultat;
  }

  static statutRenseigne(statut?: StatutMesure) {
    return identifiantsStatuts.includes(statut as StatutMesure);
  }

  static valide(
    {
      statut,
      priorite,
      echeance,
    }: { statut?: StatutMesure; priorite?: PrioriteMesure; echeance?: string },
    referentiel: Referentiel | ReferentielV2
  ) {
    if (statut && !this.statutsPossibles().includes(statut)) {
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

  static STATUT_FAIT = STATUTS.STATUT_FAIT;
  static STATUT_EN_COURS = STATUTS.STATUT_EN_COURS;
  static STATUT_NON_FAIT = STATUTS.STATUT_NON_FAIT;
  static STATUT_A_LANCER = STATUTS.STATUT_A_LANCER;
}

export default Mesure;
