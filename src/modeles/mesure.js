/*
   eslint class-methods-use-this:
     ["error", { "exceptMethods": ["estIndispensable", "estRecommandee"] }]
*/

const InformationsService = require('./informationsService');
const {
  ErreurStatutMesureInvalide,
  ErreurPrioriteMesureInvalide,
} = require('../erreurs');

const STATUTS = {
  STATUT_FAIT: 'fait',
  STATUT_EN_COURS: 'enCours',
  STATUT_NON_FAIT: 'nonFait',
  STATUT_A_LANCER: 'aLancer',
};

class Mesure extends InformationsService {
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

  static statutRenseigne(statut) {
    return Object.values(STATUTS).includes(statut);
  }

  static valide({ statut, priorite }, referentiel) {
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
  }
}

Object.assign(Mesure, STATUTS);

module.exports = Mesure;
