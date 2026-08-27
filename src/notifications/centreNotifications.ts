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
} from '../referentiel.types.js';
import Service from '../modeles/service.js';
import { SourceNotifications, StatutLecture } from './notification.types.js';
import { SourceNouveautes } from './sources/sourceNouveautes.js';
import { SourceTachesProfil } from './sources/sourceTachesProfil.js';

type Notification = {
  lien: string;
  dateFaite: Date;
  service: Service;
  donnees: Record<string, string>;
  titre: string;
};

type TacheService = {
  id: UUID;
  service: Service;
  dateCreation: Date;
  dateFaite?: Date;
  nature: IdNatureTacheService;
  statutLecture?: StatutLecture;
};

class CentreNotifications {
  private readonly referentiel: TousReferentiels;
  private readonly depotDonnees: DepotDonnees;
  private readonly adaptateurHorloge: AdaptateurHorloge;
  private readonly sources: SourceNotifications[];

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
    this.sources = [
      new SourceNouveautes(referentiel, depotDonnees, adaptateurHorloge),
      new SourceTachesProfil(referentiel, depotDonnees, adaptateurHorloge),
    ];
  }

  async toutesNotifications(idUtilisateur: UUID) {
    const [tachesDesServices] = await Promise.all([
      this.toutesTachesDeServiceNonLues(idUtilisateur),
    ]);

    return [
      ...(await this.sources[0].notificationsPour(idUtilisateur)),
      ...(await this.sources[1].notificationsPour(idUtilisateur)),
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

  async supprimeNotificationTransactionnelle(
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

    await this.depotDonnees.supprimeNotificationTransactionnelle(
      idNotification
    );
  }
}

export default CentreNotifications;
