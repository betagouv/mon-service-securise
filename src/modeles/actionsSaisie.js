const ActionSaisie = require('./actionSaisie');
const Service = require('./service');
const Referentiel = require('../referentiel');

class ActionsSaisie {
  constructor(
    referentiel = Referentiel.creeReferentielVide,
    service = new Service({})
  ) {
    this.referentiel = referentiel;
    this.service = service;
  }

  toJSON() {
    const position = this.referentiel.positionActionSaisie;

    return Object.keys(this.referentiel.actionsSaisie())
      .sort((a1, a2) => position(a1) - position(a2))
      .map((a) =>
        new ActionSaisie({ id: a }, this.referentiel, this.service).toJSON()
      );
  }
}

module.exports = ActionsSaisie;
