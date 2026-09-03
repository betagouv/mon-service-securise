import { ComparateurMesures } from './comparateurMesures.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import Service from '../../modeles/service.js';
import Utilisateur from '../../modeles/utilisateur.js';
import Mesure from '../../modeles/mesure.js';
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
  }: {
    service: Service;
    utilisateur: Utilisateur;
    ancienneMesure: Mesure;
    nouvelleMesure: Mesure;
    typeMesure: 'generale' | 'specifique';
  }) => {
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
        await depotDonnees.supprimeNotificationTransactionnelle(existante);
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
