const ActionSaisie = require('./actionSaisie');
const Homologation = require('./homologation');
const Referentiel = require('../referentiel');

class ActionsSaisie {
  constructor(
    version,
    referentiel = Referentiel.creeReferentielVide,
    homologation = new Homologation({})
  ) {
    this.version = version;
    this.referentiel = referentiel;
    this.homologation = homologation;
  }

  toJSON() {
    const position = this.referentiel.positionActionSaisie;

    return Object.keys(this.referentiel.actionsSaisie(this.version))
      .sort((a1, a2) => position(this.version, a1) - position(this.version, a2))
      .map((a) => new ActionSaisie(
        { id: a, version: this.version },
        this.referentiel,
        this.homologation
      ).toJSON());
  }
}

module.exports = ActionsSaisie;
