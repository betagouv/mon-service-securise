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
    const [taches, nouveautes] = await Promise.all([
      this.toutesTachesEnAttente(idUtilisateur),
      this.toutesNouveautes(idUtilisateur),
    ]);
    return [
      ...taches.map((t) => ({ ...t, type: 'tache' })),
      ...nouveautes.map((t) => ({ ...t, type: 'nouveaute' })),
    ];
  }

  async toutesNouveautes(idUtilisateur) {
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

  async toutesTachesEnAttente(idUtilisateur) {
    const utilisateur = await this.depotDonnees.utilisateur(idUtilisateur);
    if (!utilisateur) {
      return [];
    }

    const completudeProfil = utilisateur.completudeProfil();
    if (completudeProfil.estComplet) {
      return [];
    }

    return completudeProfil.champsNonRenseignes
      .map((champ) => this.referentiel.tacheCompletudeProfil(champ))
      .filter((t) => t !== undefined)
      .map((t) => ({
        ...t,
        statutLecture: CentreNotifications.NOTIFICATION_NON_LUE,
      }));
  }

  static NOTIFICATION_LUE = 'lue';

  static NOTIFICATION_NON_LUE = 'nonLue';
}

module.exports = CentreNotifications;
