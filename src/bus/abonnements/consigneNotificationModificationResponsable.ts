import { ComparateurMesures } from './comparateurMesures.js';
import EvenementMesureServiceModifiee from '../evenementMesureServiceModifiee.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { NotificationTransactionnelle } from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import { UUID } from '../../typesBasiques.js';

export const consigneNotificationModificationResponsable =
  ({ depotDonnees }: { depotDonnees: DepotDonnees }) =>
  async ({
    service,
    utilisateur,
    ancienneMesure,
    nouvelleMesure,
    typeMesure,
  }: EvenementMesureServiceModifiee) => {
    const comparateur = new ComparateurMesures(ancienneMesure, nouvelleMesure);

    const consigneNotification = async (idDestinataire: UUID) =>
      depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          date: new Date(),
          type: 'responsableMesure',
          idActeur: utilisateur.id,
          idDestinataire,
          metadonnees: {
            idMesure: nouvelleMesure.id,
            idService: service.id,
            typeMesure,
          },
        })
      );

    const supprimeNotification = async (idDestinataire: UUID) => {
      const notificationsUtilisateur =
        await depotDonnees.lisNotifications(idDestinataire);
      const existante = notificationsUtilisateur.find((n) => {
        const donnees = n.donnees();
        return (
          donnees.type === 'responsableMesure' &&
          donnees.metadonnees.idMesure === nouvelleMesure.id &&
          donnees.metadonnees.idService === service.id
        );
      });

      if (existante)
        await depotDonnees.supprimeNotificationTransactionnelle(
          existante,
          'systeme'
        );
    };

    await Promise.all(
      comparateur
        .responsablesAjoutes()
        .filter((idDestinataire) => idDestinataire !== utilisateur.id)
        .map(consigneNotification)
    );
    await Promise.all(
      comparateur.responsablesRetires().map(supprimeNotification)
    );
  };
