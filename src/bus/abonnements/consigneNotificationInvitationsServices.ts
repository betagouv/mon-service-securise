import { DepotDonnees } from '../../depotDonnees.interface.js';
import Service from '../../modeles/service.js';
import Utilisateur from '../../modeles/utilisateur.js';
import { NotificationTransactionnelle } from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

export const consigneNotificationInvitationsServices =
  ({ depotDonnees }: { depotDonnees: DepotDonnees }) =>
  async ({
    acteur,
    destinataire,
    services,
  }: {
    services: Service[];
    acteur: Utilisateur;
    destinataire: Utilisateur;
  }) => {
    const consigneNotification = async (service: Service) =>
      depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          date: new Date(),
          type: 'invitationService',
          idActeur: acteur.id,
          idDestinataire: destinataire.id,
          metadonnees: {
            idService: service.id,
          },
        })
      );

    await Promise.all(services.map(consigneNotification));
  };
