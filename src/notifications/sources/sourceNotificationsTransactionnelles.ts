import {
  Notification,
  SourceNotifications,
  StatutLecture,
} from '../notification.types.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';
import { Contributeur } from '../../modeles/contributeur.js';
import MesureSpecifique from '../../modeles/mesureSpecifique.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';
import { nombreDeJoursCalendaires } from '../../utilitaires/date.js';
import {
  MetadonneesNotificationExpirationHomologation,
  MetadonneesNotificationMesure,
  MetadonneesNotificationService,
  NotificationTransactionnelle,
} from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import Service from '../../modeles/service.js';
import { IdMesure } from '../../referentiel.types.js';

export class SourceNotificationsTransactionnelles implements SourceNotifications {
  constructor(
    private readonly depotDonnees: DepotDonnees,
    private readonly adaptateurHorloge: AdaptateurHorloge
  ) {}

  async notificationsPour(idUtilisateur: UUID): Promise<Notification[]> {
    const notifications =
      await this.depotDonnees.lisNotifications(idUtilisateur);

    const lesServices = await this.depotDonnees.services(idUtilisateur);

    return notifications
      .filter((n) => n.donnees().date <= this.adaptateurHorloge.maintenant())
      .filter(
        (n) =>
          !n.donnees().dateExpiration ||
          n.donnees().dateExpiration! > this.adaptateurHorloge.maintenant()
      )
      .map((n) => {
        const { idService } = n.donnees().metadonnees;
        const service = lesServices.find((s) => s.id === idService);
        if (!service) return undefined;

        let donnees;
        const typeNotification = n.donnees().type;
        if (typeNotification === 'invitationService')
          donnees = this.donneesNotificationService(n, service);
        else if (
          typeNotification === 'homologationBientotExpiree' ||
          typeNotification === 'homologationExpiree'
        )
          donnees = this.donneesNotificationExpirationHomologation(n, service);
        else donnees = this.donneesNotificationMesure(n, service);

        const { type, titreCta, canalDiffusion } =
          service.referentiel.notificationTransactionnelle(typeNotification);

        return {
          ...donnees,
          id: n.donnees().id,
          type,
          titreCta,
          canalDiffusion,
          statutLecture: n.donnees().lue
            ? StatutLecture.lue
            : StatutLecture.nonLue,
          doitNotifierLecture: true,
          supprimable: true,
          horodatage: n.donnees().date,
          date: () => n.donnees().date,
        };
      })
      .filter((n) => !!n) as Notification[];
  }

  private donneesNotificationMesure(
    n: NotificationTransactionnelle,
    service: Service
  ) {
    const { idMesure, typeMesure } = n.donnees()
      .metadonnees as MetadonneesNotificationMesure;
    let titreMesure: string | undefined;
    if (typeMesure === 'generale')
      titreMesure = service.referentiel.mesure(
        idMesure as IdMesure
      ).description;
    else
      titreMesure = service
        .mesuresSpecifiques()
        .toutes()
        .find((m: MesureSpecifique) => m.id === idMesure)?.description;

    const dateEcheanceMesure =
      typeMesure === 'generale'
        ? service.mesures.mesuresGenerales.avecId(idMesure)?.echeance
        : service.mesures.mesuresSpecifiques.avecId(idMesure as UUID)?.echeance;

    const nombreJoursDiciEcheance = dateEcheanceMesure
      ? nombreDeJoursCalendaires(
          this.adaptateurHorloge.maintenant(),
          dateEcheanceMesure
        )
      : 0;

    const contributeur: Contributeur = service.contributeurParId(
      n.donnees().idActeur
    );
    const nomActeur = contributeur.estAdmin
      ? 'Un administrateur'
      : contributeur.prenomNom();

    const { titre, sousTitre, lien } =
      service.referentiel.notificationTransactionnelle(n.donnees().type);

    return {
      titre: titre({ nombreJoursDiciEcheance, nombreMoisDiciEcheance: 0 }),
      sousTitre: sousTitre({
        nomActeur,
        titreMesure: titreMesure || '',
        nomService: service.nomService(),
        dateEcheanceMesure:
          dateEcheanceMesure || this.adaptateurHorloge.maintenant(),
        dateExpirationHomologation: this.adaptateurHorloge.maintenant(),
      }),
      lien: lien({ idService: service.id, idMesure }),
    };
  }

  private donneesNotificationExpirationHomologation(
    notification: NotificationTransactionnelle,
    service: Service
  ) {
    const { titre, sousTitre, lien } =
      service.referentiel.notificationTransactionnelle(
        notification.donnees().type
      );
    const { idService, dateExpirationHomologation } = notification.donnees()
      .metadonnees as MetadonneesNotificationExpirationHomologation;

    const moisEntre = (debut: Date, fin: Date) => {
      const mois =
        (fin.getFullYear() - debut.getFullYear()) * 12 +
        (fin.getMonth() - debut.getMonth());

      return Math.max(mois, 1);
    };

    const nombreMoisDiciEcheance = moisEntre(
      this.adaptateurHorloge.maintenant(),
      dateExpirationHomologation
    );

    const donneesSpecifiques = {
      titre: titre({ nombreJoursDiciEcheance: 0, nombreMoisDiciEcheance }),
      sousTitre: sousTitre({
        nomService: service.nomService(),
        dateExpirationHomologation,
        titreMesure: '',
        dateEcheanceMesure: this.adaptateurHorloge.maintenant(),
        nomActeur: '',
      }),
      lien: lien({ idService, idMesure: '' }),
    };
    return donneesSpecifiques;
  }

  private donneesNotificationService(
    notification: NotificationTransactionnelle,
    service: Service
  ) {
    const { titre, sousTitre, lien } =
      service.referentiel.notificationTransactionnelle(
        notification.donnees().type
      );
    const { idService } = notification.donnees()
      .metadonnees as MetadonneesNotificationService;

    return {
      titre: titre({ nombreJoursDiciEcheance: 0, nombreMoisDiciEcheance: 0 }),
      sousTitre: sousTitre({
        nomService: service.nomService(),
        dateExpirationHomologation: this.adaptateurHorloge.maintenant(),
        nomActeur: '',
        dateEcheanceMesure: this.adaptateurHorloge.maintenant(),
        titreMesure: '',
      }),
      lien: lien({ idService, idMesure: '' }),
    };
  }
}
