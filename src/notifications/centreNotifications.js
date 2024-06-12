const { ErreurIdentifiantNouveauteInconnu } = require('../erreurs');

const avecStatutLecture = (notification, statutLecture) => ({
  ...notification,
  statutLecture,
});

class CentreNotifications {
  constructor({ referentiel, depotDonnees, adaptateurHorloge }) {
    if (!referentiel || !depotDonnees || !adaptateurHorloge) {
      throw new Error(
        "Impossible d'instancier le centre de notifications sans ses dépendances"
      );
    }
    this.referentiel = referentiel;
    this.depotDonnees = depotDonnees;
    this.adaptateurHorloge = adaptateurHorloge;
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
      .filter(
        (n) =>
          new Date(n.dateDeDeploiement) <= this.adaptateurHorloge.maintenant()
      )
      .sort(
        (a, b) => new Date(b.dateDeDeploiement) - new Date(a.dateDeDeploiement)
      );

    const etatLectureNouveautes =
      await this.depotDonnees.nouveautesPourUtilisateur(idUtilisateur);

    return toutesNouveautes.map((n) => {
      const statutLecture = etatLectureNouveautes.includes(n.id)
        ? CentreNotifications.NOTIFICATION_LUE
        : CentreNotifications.NOTIFICATION_NON_LUE;
      return avecStatutLecture(n, statutLecture);
    });
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

    if (completudeProfil.champsNonRenseignes.includes('nom')) {
      const tache = this.referentiel.tacheCompletudeProfil('profil');
      return [
        avecStatutLecture(tache, CentreNotifications.NOTIFICATION_NON_LUE),
      ];
    }

    return completudeProfil.champsNonRenseignes
      .map((champ) => this.referentiel.tacheCompletudeProfil(champ))
      .filter((t) => t !== undefined)
      .map((t) =>
        avecStatutLecture(t, CentreNotifications.NOTIFICATION_NON_LUE)
      );
  }

  static NOTIFICATION_LUE = 'lue';

  static NOTIFICATION_NON_LUE = 'nonLue';
}

module.exports = CentreNotifications;
