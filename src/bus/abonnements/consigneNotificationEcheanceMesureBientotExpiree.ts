import { ComparateurMesures } from './comparateurMesures.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import Service from '../../modeles/service.js';
import Utilisateur from '../../modeles/utilisateur.js';
import Mesure from '../../modeles/mesure.js';
import { NotificationTransactionnelle } from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import { UUID } from '../../typesBasiques.js';
import { Contributeur } from '../../modeles/contributeur.js';

export const consigneNotificationEcheanceMesureBientotExpiree =
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

    const consigneNotification = async (idDestinataire: UUID) => {
      const deuxSemainesAvant = new Date(nouvelleMesure.echeance!);
      deuxSemainesAvant.setDate(deuxSemainesAvant.getDate() - 14);

      return depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          date: deuxSemainesAvant,
          type: 'echeanceMesureBientotExpiree',
          idActeur: utilisateur.id,
          idDestinataire,
          metadonnees: {
            idMesure: nouvelleMesure.id,
            idService: service.id,
            typeMesure,
          },
        })
      );
    };

    const supprimeNotification = async (idDestinataire: UUID) => {
      const notificationsUtilisateur =
        await depotDonnees.lisNotifications(idDestinataire);
      const existante = notificationsUtilisateur.find((n) => {
        const donnees = n.donnees();
        return (
          donnees.type === 'echeanceMesureBientotExpiree' &&
          donnees.metadonnees.idMesure === nouvelleMesure.id &&
          donnees.metadonnees.idService === service.id
        );
      });

      if (existante)
        await depotDonnees.supprimeNotificationTransactionnelle(existante);
    };

    const destinataires: UUID[] = nouvelleMesure.responsables.length
      ? nouvelleMesure.responsables
      : service.contributeurs
          .filter((c: Contributeur) => c.estProprietaire)
          .map((c: Contributeur) => c.idUtilisateur);

    if (comparateur.aAjoute('echeance'))
      await Promise.all(destinataires.map(consigneNotification));

    if (comparateur.aSupprime('echeance'))
      await Promise.all(destinataires.map(supprimeNotification));

    if (comparateur.aMisAJour('echeance'))
      await Promise.all(
        destinataires.map(async (idDestinataire) => {
          await supprimeNotification(idDestinataire);
          await consigneNotification(idDestinataire);
        })
      );
  };
