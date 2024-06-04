const { ErreurIdentifiantNouveauteInconnu } = require('../erreurs');

class CentreNotifications {
  constructor({ referentiel, depotDonnees }) {
    if (!referentiel || !depotDonnees) {
      throw new Error(
        "Impossible d'instancier le centre de notifications sans ses dépendances"
      );
    }
    this.referentiel = referentiel;
    this.depotDonnees = depotDonnees;
  }

  toutesNotifications() {
    return this.referentiel
      .nouvellesFonctionnalites()
      .sort(
        (a, b) => new Date(b.dateDeDeploiement) - new Date(a.dateDeDeploiement)
      );
  }

  async marqueNouveauteLue(idUtilisateur, idNouveaute) {
    const identifiantsConnus = this.referentiel
      .nouvellesFonctionnalites()
      .map((n) => n.id);
    if (!identifiantsConnus.includes(idNouveaute)) {
      throw new ErreurIdentifiantNouveauteInconnu();
    }
    await this.depotDonnees.marqueNouveauteLue(idUtilisateur, idNouveaute);
  }
}

module.exports = CentreNotifications;
