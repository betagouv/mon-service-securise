import {
  ErreurIdentifiantNotificationTransactionnelleInconnu,
  ErreurIdentifiantNouveauteInconnu,
  ErreurIdentifiantTacheInconnu,
} from '../erreurs.js';
import { AdaptateurHorloge } from '../adaptateurs/adaptateurHorloge.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { TousReferentiels } from '../referentiel.interface.js';
import { UUID } from '../typesBasiques.js';
import {
  IdNatureTacheService,
  IdNouvelleFonctionnalite,
  IdTacheCompletudeProfil,
} from '../referentiel.types.js';
import Service from '../modeles/service.js';

type Notification = {
  lien: string;
  dateFaite: Date;
  service: Service;
  donnees: Record<string, string>;
  titre: string;
};

enum StatutLecture {
  lue = 'lue',
  nonLue = 'nonLue',
}

type TacheProfil = {
  id: IdTacheCompletudeProfil;
  lien: string;
  entete: string;
  titre: string;
  titreCta: string;
};

type Nouveaute = {
  id: IdNouvelleFonctionnalite;
  dateDeDeploiement: string;
  lien: string;
  titre: string;
  sousTitre: string;
  image: string;
  canalDiffusion: string;
  titreCta: string;
  statutLecture?: StatutLecture;
};

type TacheService = {
  id: UUID;
  service: Service;
  dateCreation: Date;
  dateFaite?: Date;
  nature: IdNatureTacheService;
  statutLecture?: StatutLecture;
};

const avecCanalDiffusion = (
  notification: TacheProfil,
  canalDiffusion: string
) => ({
  ...notification,
  canalDiffusion,
});

class CentreNotifications {
  private readonly referentiel: TousReferentiels;
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurHorloge: AdaptateurHorloge;

  constructor({
    referentiel,
    depotDonnees,
    adaptateurHorloge,
  }: {
    referentiel: TousReferentiels;
    depotDonnees: DepotDonnees;
    adaptateurHorloge: AdaptateurHorloge;
  }) {
    if (!referentiel || !depotDonnees || !adaptateurHorloge) {
      throw new Error(
        "Impossible d'instancier le centre de notifications sans ses dépendances"
      );
    }
    this.referentiel = referentiel;
    this.depotDonnees = depotDonnees;
    this.adaptateurHorloge = adaptateurHorloge;
  }

  async toutesNotifications(idUtilisateur: UUID) {
    const [tachesProfil, nouveautes, tachesDesServices] = await Promise.all([
      this.toutesTachesProfilUtilisateur(idUtilisateur),
      this.toutesNouveautes(idUtilisateur),
      this.toutesTachesDeServiceNonLues(idUtilisateur),
    ]);

    return [
      ...tachesProfil.map((t: TacheProfil) => ({
        ...t,
        type: 'tache',
        date: () => this.adaptateurHorloge.maintenant(),
      })),
      ...nouveautes.map((t: Nouveaute) => ({
        ...t,
        type: 'nouveaute',
        doitNotifierLecture: true,
        date: () => new Date(t.dateDeDeploiement),
        horodatage: new Date(t.dateDeDeploiement),
      })),

      ...tachesDesServices.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ service: _service, ...donneesTache }: TacheService) => ({
          ...donneesTache,
          type: 'tache',
          doitNotifierLecture: true,
          date: () => donneesTache.dateCreation,
          horodatage: donneesTache.dateCreation,
        })
      ),
    ].sort((a, b) => b.date() - a.date());
  }

  async toutesTachesDeServiceNonLues(idUtilisateur: UUID) {
    const taches = await this.depotDonnees.tachesDesServices(idUtilisateur);
    const notifications = taches
      .filter((tache: TacheService) => !tache.dateFaite)
      .map((tache: TacheService) => ({
        ...tache,
        ...this.referentiel.natureTachesService(tache.nature),
        canalDiffusion: 'centreNotifications',
      }));

    return notifications.map((notification: Notification) => ({
      ...notification,
      titre: CentreNotifications.titreFusionne(notification),
      lien: notification.lien.replace('%ID_SERVICE%', notification.service.id),
      statutLecture: notification.dateFaite
        ? StatutLecture.lue
        : StatutLecture.nonLue,
    }));
  }

  static titreFusionne(notification: Notification) {
    const champsDonnees = Object.keys(notification.donnees || {});
    const valeurReelle = (champ: string): string => {
      if (champ === 'NOM_SERVICE') return notification.service?.nomService();
      return notification.donnees?.[champ] as string;
    };

    return ['NOM_SERVICE', ...champsDonnees].reduce(
      (acc, cle) => acc.replace(`%${cle}%`, valeurReelle(cle)),
      notification.titre
    );
  }

  async toutesNouveautes(idUtilisateur: UUID) {
    const avant = this.referentiel.nouvellesFonctionnalites();

    const utilisateur = await this.depotDonnees.utilisateur(idUtilisateur);

    const toutesNouveautes = avant.filter(
      (n) =>
        new Date(n.dateDeDeploiement) <= this.adaptateurHorloge.maintenant() &&
        new Date(n.dateDeDeploiement) >=
          new Date(utilisateur?.dateCreation ?? 0)
    );

    const etatLectureNouveautes =
      await this.depotDonnees.nouveautesPourUtilisateur(idUtilisateur);

    return toutesNouveautes.map((n: Nouveaute) => {
      // eslint-disable-next-line no-param-reassign
      n.statutLecture = etatLectureNouveautes.includes(n.id)
        ? StatutLecture.lue
        : StatutLecture.nonLue;
      return n;
    });
  }

  async marqueNouveauteLue(
    idUtilisateur: UUID,
    idNouveaute: IdNouvelleFonctionnalite
  ) {
    const identifiantsConnus = this.referentiel
      .nouvellesFonctionnalites()
      .map((n) => n.id);
    if (!identifiantsConnus.includes(idNouveaute)) {
      throw new ErreurIdentifiantNouveauteInconnu();
    }
    await this.depotDonnees.marqueNouveauteLue(idUtilisateur, idNouveaute);
  }

  async marqueTacheDeServiceLue(idUtilisateur: UUID, idTache: UUID) {
    const taches = await this.depotDonnees.tachesDesServices(idUtilisateur);
    if (!taches.find((t: TacheService) => t.id)) {
      throw new ErreurIdentifiantTacheInconnu();
    }
    await this.depotDonnees.marqueTacheDeServiceLue(idTache);
  }

  async toutesTachesProfilUtilisateur(idUtilisateur: UUID) {
    const utilisateur = await this.depotDonnees.utilisateur(idUtilisateur);
    if (!utilisateur) return [];

    const completudeProfil = utilisateur.completudeProfil();
    if (completudeProfil.estComplet) return [];

    const profilDeInvite = completudeProfil.champsNonRenseignes.includes('nom');

    const tachesAFaire = profilDeInvite
      ? [this.referentiel.tacheCompletudeProfil('profil') as TacheProfil]
      : (completudeProfil.champsNonRenseignes
          .map((champ) =>
            this.referentiel.tacheCompletudeProfil(
              champ as IdTacheCompletudeProfil
            )
          )
          .filter((t) => t !== undefined) as TacheProfil[]);

    return tachesAFaire
      .map((t: TacheProfil) => ({ ...t, statutLecture: StatutLecture.nonLue }))
      .map((t: TacheProfil) => avecCanalDiffusion(t, 'centreNotifications'));
  }

  async marqueNotificationTransactionnelleLue(
    idNotification: UUID,
    idUtilisateur: UUID
  ) {
    const notification = await this.depotDonnees.lisNotificationDe(
      idNotification,
      idUtilisateur
    );

    if (!notification) {
      throw new ErreurIdentifiantNotificationTransactionnelleInconnu();
    }

    notification.marqueCommeLue();
    await this.depotDonnees.sauvegardeNotificationTransactionnelle(
      notification
    );
  }
}

export default CentreNotifications;
