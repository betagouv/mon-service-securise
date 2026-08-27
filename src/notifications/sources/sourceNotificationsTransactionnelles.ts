import {
  Notification,
  SourceNotifications,
  StatutLecture,
} from '../notification.types.js';
import { TousReferentiels } from '../../referentiel.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';

export class SourceNotificationsTransactionnelles implements SourceNotifications {
  constructor(
    private readonly referentiel: TousReferentiels,
    private readonly depotDonnees: DepotDonnees
  ) {}

  async notificationsPour(idUtilisateur: UUID): Promise<Notification[]> {
    const notifications =
      await this.depotDonnees.lisNotifications(idUtilisateur);
    return notifications.map((n) => ({
      id: n.donnees().id,
      type: 'activite',
      titre: 'Mention',
      sousTitre: 'expect.any(String)',
      titreCta: 'Voir le commentaire',
      lien: `/service/${n.donnees().metadonnees.idService}/mesures?idMesure=RECENSEMENT.1&onglet=activite`,
      canalDiffusion: 'centreNotifications',
      statutLecture: n.donnees().lue ? StatutLecture.lue : StatutLecture.nonLue,
      doitNotifierLecture: true,
      horodatage: n.donnees().date,
      date: () => n.donnees().date,
    }));
  }
}
