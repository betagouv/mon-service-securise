const AutorisationBase = require('./autorisationBase');

class AutorisationCreateur extends AutorisationBase {
  constructor(...params) {
    super(...params);

    this.permissionAjoutContributeur = true;
    this.permissionSuppressionContributeur = true;
    this.permissionSuppressionService = true;
  }
}

module.exports = AutorisationCreateur;
