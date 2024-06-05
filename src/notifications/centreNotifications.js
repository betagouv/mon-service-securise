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

  async toutesNotifications(idUtilisateur) {
    const toutesNouveautes = this.referentiel
      .nouvellesFonctionnalites()
      .sort(
        (a, b) => new Date(b.dateDeDeploiement) - new Date(a.dateDeDeploiement)
      );

    const etatLectureNouveautes =
      await this.depotDonnees.nouveautesPourUtilisateur(idUtilisateur);

    return toutesNouveautes.map((n) => ({
      ...n,
      statutLecture: etatLectureNouveautes.includes(n.id)
        ? CentreNotifications.NOTIFICATION_LUE
        : CentreNotifications.NOTIFICATION_NON_LUE,
    }));
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

  static NOTIFICATION_LUE = 'lue';

  static NOTIFICATION_NON_LUE = 'nonLue';
}

module.exports = CentreNotifications;
