import {
  ErreurIdentifiantNotificationTransactionnelleInconnu,
  ErreurIdentifiantNouveauteInconnu,
  ErreurIdentifiantTacheInconnu,
} from '../erreurs.js';
import { AdaptateurHorloge } from '../adaptateurs/adaptateurHorloge.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import { TousReferentiels } from '../referentiel.interface.js';
import { UUID } from '../typesBasiques.js';
import { IdNouvelleFonctionnalite } from '../referentiel.types.js';
import { SourceNotifications } from './notification.types.js';
import { SourceNouveautes } from './sources/sourceNouveautes.js';
import { SourceTachesProfil } from './sources/sourceTachesProfil.js';
import { SourceTachesService } from './sources/sourceTachesService.js';

class CentreNotifications {
  private readonly referentiel: TousReferentiels;
  private readonly depotDonnees: DepotDonnees;
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
    this.sources = [
      new SourceNouveautes(referentiel, depotDonnees, adaptateurHorloge),
      new SourceTachesProfil(referentiel, depotDonnees, adaptateurHorloge),
      new SourceTachesService(referentiel, depotDonnees),
    ];
  }

  async toutesNotifications(idUtilisateur: UUID) {
    const toutes = await Promise.all(
      this.sources.map((s) => s.notificationsPour(idUtilisateur))
    );

    return toutes
      .flat()
      .sort((a, b) => b.date().getTime() - a.date().getTime());
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
    if (!taches.find(({ id }: { id: UUID }) => id === idTache)) {
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
