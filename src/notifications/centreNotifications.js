const {
  ErreurIdentifiantNouveauteInconnu,
  ErreurIdentifiantTacheInconnu,
} = require('../erreurs');

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
    const [tachesProfil, nouveautes, tachesDesServices] = await Promise.all([
      this.toutesTachesProfilUtilisateur(idUtilisateur),
      this.toutesNouveautes(idUtilisateur),
      this.toutesTachesDeService(idUtilisateur),
    ]);

    return [
      ...tachesProfil.map((t) => ({
        ...t,
        type: 'tache',
        date: () => this.adaptateurHorloge.maintenant(),
      })),
      ...nouveautes.map((t) => ({
        ...t,
        type: 'nouveaute',
        doitNotifierLecture: true,
        date: () => new Date(t.dateDeDeploiement),
        horodatage: new Date(t.dateDeDeploiement),
      })),
      ...tachesDesServices.map((t) => ({
        ...t,
        type: 'tache',
        doitNotifierLecture: true,
        date: () => t.dateCreation,
        horodatage: t.dateCreation,
      })),
    ].sort((a, b) => b.date() - a.date());
  }

  async toutesTachesDeService(idUtilisateur) {
    const taches = await this.depotDonnees.tachesDesServices(idUtilisateur);
    const notifications = taches.map((tache) => ({
      ...tache,
      ...this.referentiel.natureTachesService(tache.nature),
    }));

    return notifications.map((notification) => ({
      ...notification,
      titre: CentreNotifications.titreFusionne(notification),
      lien: notification.lien.replace('%ID_SERVICE%', notification.service.id),
      statutLecture: notification.dateFaite
        ? CentreNotifications.NOTIFICATION_LUE
        : CentreNotifications.NOTIFICATION_NON_LUE,
    }));
  }

  static titreFusionne(notification) {
    const champsDonnees = Object.keys(notification.donnees || {});
    const valeurReelle = (champ) => {
      if (champ === 'NOM_SERVICE') return notification.service?.nomService();
      return notification.donnees?.[champ];
    };

    return ['NOM_SERVICE', ...champsDonnees].reduce(
      (acc, cle) => acc.replace(`%${cle}%`, valeurReelle(cle)),
      notification.titre
    );
  }

  async toutesNouveautes(idUtilisateur) {
    const avant = this.referentiel.nouvellesFonctionnalites();

    const toutesNouveautes = avant.filter(
      (n) =>
        new Date(n.dateDeDeploiement) <= this.adaptateurHorloge.maintenant()
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

  async marqueTacheDeServiceLue(idUtilisateur, idTache) {
    const taches = await this.depotDonnees.tachesDesServices(idUtilisateur);
    if (!taches.find((t) => t.id)) {
      throw new ErreurIdentifiantTacheInconnu();
    }
    await this.depotDonnees.marqueTacheDeServiceLue(idTache);
  }

  async toutesTachesProfilUtilisateur(idUtilisateur) {
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
