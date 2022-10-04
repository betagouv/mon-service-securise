const ActionSaisie = require('./actionSaisie');
const Homologation = require('./homologation');
const Referentiel = require('../referentiel');

class ActionsSaisie {
  constructor(referentiel = Referentiel.creeReferentielVide, homologation = new Homologation({})) {
    this.referentiel = referentiel;
    this.homologation = homologation;
  }

  toJSON() {
    const position = this.referentiel.positionActionSaisie;

    return Object.keys(this.referentiel.actionsSaisie())
      .sort((a1, a2) => position(a1) - position(a2))
      .map((a) => new ActionSaisie(
        { id: a, version: ActionsSaisie.versionParDefaut() },
        this.referentiel,
        this.homologation
      ).toJSON());
  }

  static versionParDefaut() {
    return 'v1';
  }
}

module.exports = ActionsSaisie;
