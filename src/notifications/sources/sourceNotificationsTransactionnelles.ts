import {
  Notification,
  SourceNotifications,
  StatutLecture,
} from '../notification.types.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';
import { Contributeur } from '../../modeles/contributeur.js';
import MesureSpecifique from '../../modeles/mesureSpecifique.js';

export class SourceNotificationsTransactionnelles implements SourceNotifications {
  constructor(private readonly depotDonnees: DepotDonnees) {}

  async notificationsPour(idUtilisateur: UUID): Promise<Notification[]> {
    const notifications =
      await this.depotDonnees.lisNotifications(idUtilisateur);

    const lesServices = await this.depotDonnees.services(idUtilisateur);

    return notifications
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

        return {
          id: n.donnees().id,
          type: 'activite',
          titre: 'Mention',
          sousTitre: `${nomActeur} vous a mentionné sur la mesure « ${titreMesure} » de [${service.nomService()}]`,
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
      })
      .filter((n) => !!n) as Notification[];
  }
}
