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
      .sort((id1, id2) => position(id1) - position(id2))
      .map((id) => new ActionSaisie({ id }, this.referentiel, this.service))
      .map((a) => a.toJSON());
  }
}

module.exports = ActionsSaisie;
