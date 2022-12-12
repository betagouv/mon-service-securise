/*
   eslint class-methods-use-this:
     ["error", { "exceptMethods": ["estIndispensable", "estRecommandee"] }]
*/

const InformationsHomologation = require('./informationsHomologation');
const { ErreurStatutMesureInvalide } = require('../erreurs');

const STATUTS = {
  STATUT_FAIT: 'fait',
  STATUT_EN_COURS: 'enCours',
  STATUT_NON_FAIT: 'nonFait',
};

class Mesure extends InformationsHomologation {
  estIndispensable() {
    return false;
  }

  estRecommandee() {
    return false;
  }

  static accumulateurInitialStatuts(statutFaitALaFin = false) {
    return Mesure.statutsPossibles(statutFaitALaFin)
      .reduce((acc, s) => ({ ...acc, [s]: {} }), {});
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
    return Object.keys(STATUTS)
      .map((clef) => STATUTS[clef])
      .includes(statut);
  }

  static valide({ statut }) {
    if (statut && !this.statutsPossibles().includes(statut)) {
      throw new ErreurStatutMesureInvalide(`Le statut "${statut}" est invalide`);
    }
  }
}

Object.assign(Mesure, STATUTS);

module.exports = Mesure;
