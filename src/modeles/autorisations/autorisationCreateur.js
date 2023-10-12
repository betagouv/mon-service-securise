const AutorisationBase = require('./autorisationBase');

class AutorisationCreateur extends AutorisationBase {
  constructor(...params) {
    super(...params);

    this.permissionAjoutContributeur = true;
    this.permissionSuppressionContributeur = true;
    this.estProprietaire = true;
  }

  donneesAPersister() {
    return { ...super.donneesAPersister(), type: 'createur' };
  }
}

module.exports = AutorisationCreateur;
