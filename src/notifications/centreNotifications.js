class CentreNotifications {
  constructor({ referentiel }) {
    if (!referentiel) {
      throw new Error(
        "Impossible d'instancier le centre de notifications sans ses dépendances"
      );
    }
    this.referentiel = referentiel;
  }

  toutesNotifications() {
    return this.referentiel
      .nouvellesFonctionnalites()
      .sort(
        (a, b) => new Date(b.dateDeDeploiement) - new Date(a.dateDeDeploiement)
      );
  }
}

module.exports = CentreNotifications;
