const AutorisationBase = require('./autorisationBase');

class AutorisationContributeur extends AutorisationBase {
  donneesAPersister() {
    return { ...super.donneesAPersister(), type: 'contributeur' };
  }
}

module.exports = AutorisationContributeur;
