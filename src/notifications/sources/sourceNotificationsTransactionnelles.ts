import {
  Notification,
  SourceNotifications,
  StatutLecture,
} from '../notification.types.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';
import { Contributeur } from '../../modeles/contributeur.js';

export class SourceNotificationsTransactionnelles implements SourceNotifications {
  constructor(private readonly depotDonnees: DepotDonnees) {}

  async notificationsPour(idUtilisateur: UUID): Promise<Notification[]> {
    const notifications =
      await this.depotDonnees.lisNotifications(idUtilisateur);

    const lesServices = await this.depotDonnees.services(idUtilisateur);

    return notifications.map((n) => {
      const { idService, idMesure } = n.donnees().metadonnees;
      const service = lesServices.find((s) => s.id === idService);
      const contributeur: Contributeur = service.contributeurParId(
        n.donnees().idActeur
      );
      const mesure = service.referentiel.mesure(idMesure).description;

      return {
        id: n.donnees().id,
        type: 'activite',
        titre: 'Mention',
        sousTitre: `${contributeur.prenomNom()} vous a mentionné sur la mesure « ${mesure} » de [${service.nomService()}]`,
        titreCta: 'Voir le commentaire',
        lien: `/service/${idService}/mesures?idMesure=${idMesure}&onglet=activite`,
        canalDiffusion: 'centreNotifications',
        statutLecture: n.donnees().lue
          ? StatutLecture.lue
          : StatutLecture.nonLue,
        doitNotifierLecture: true,
        horodatage: n.donnees().date,
        date: () => n.donnees().date,
      };
    });
  }
}
