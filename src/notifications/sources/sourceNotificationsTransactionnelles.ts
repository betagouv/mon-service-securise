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
      .map((n) => {
        const { idService, idMesure, typeMesure } = n.donnees().metadonnees;
        const service = lesServices.find((s) => s.id === idService);
        if (!service) return undefined;

        let titreMesure: string;
        if (typeMesure === 'generale')
          titreMesure = service.referentiel.mesure(idMesure).description;
        else
          titreMesure = service
            .mesuresSpecifiques()
            .toutes()
            .find((m: MesureSpecifique) => m.id === idMesure)?.description;

        const contributeur: Contributeur = service.contributeurParId(
          n.donnees().idActeur
        );
        const nomActeur = contributeur.estAdmin
          ? 'Un administrateur'
          : contributeur.prenomNom();

        const { type, titre, sousTitre, titreCta, lien, canalDiffusion } =
          service.referentiel.notificationTransactionnelle(n.donnees().type);

        return {
          id: n.donnees().id,
          type,
          titre,
          sousTitre: sousTitre(nomActeur, titreMesure, service.nomService()),
          titreCta,
          lien: lien(idService, idMesure),
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
}
