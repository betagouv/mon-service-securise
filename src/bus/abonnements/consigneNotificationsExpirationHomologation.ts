import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';
import Dossier from '../../modeles/dossier.js';
import { Contributeur } from '../../modeles/contributeur.js';
import { NotificationTransactionnelle } from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import NotificationExpirationHomologation from '../../modeles/notificationExpirationHomologation.js';
import { AdaptateurHorloge } from '../../adaptateurs/adaptateurHorloge.js';

export const consigneNotificationsExpirationHomologation =
  ({
    depotDonnees,
    adaptateurHorloge,
  }: {
    depotDonnees: DepotDonnees;
    adaptateurHorloge: AdaptateurHorloge;
  }) =>
  async ({ idService, dossier }: { idService: UUID; dossier: Dossier }) => {
    const service = await depotDonnees.service(idService);
    const proprietaires = service!.contributeurs.filter(
      (c: Contributeur) => c.estProprietaire
    );

    const supprimeNotification = async (idDestinataire: UUID) => {
      const notificationsUtilisateur =
        await depotDonnees.lisNotifications(idDestinataire);
      const existantes = notificationsUtilisateur.filter((n) => {
        const donnees = n.donnees();
        return (
          (donnees.type === 'homologationExpiree' ||
            donnees.type === 'homologationBientotExpiree') &&
          donnees.metadonnees.idService === idService
        );
      });

      await Promise.all(
        existantes.map((e) =>
          depotDonnees.supprimeNotificationTransactionnelle(e, 'systeme')
        )
      );
    };

    await Promise.all(
      proprietaires.map((c: Contributeur) =>
        supprimeNotification(c.idUtilisateur)
      )
    );

    const notifications = NotificationExpirationHomologation.pourUnDossier({
      idService,
      dossier,
      referentiel: service!.referentiel,
    }).filter(
      (n) => n.dateProchainEnvoi > adaptateurHorloge.maintenant()
    ) as NotificationExpirationHomologation[];

    await Promise.all(
      proprietaires.flatMap((c: Contributeur) =>
        notifications.map((n, idx) => {
          const notificationSuivante = notifications[idx + 1];
          return depotDonnees.sauvegardeNotificationTransactionnelle(
            NotificationTransactionnelle.nouveau({
              idActeur: c.idUtilisateur,
              idDestinataire: c.idUtilisateur,
              date: n.dateProchainEnvoi,
              dateExpiration: notificationSuivante?.dateProchainEnvoi,
              type:
                n.delaiAvantExpirationMois === 0
                  ? 'homologationExpiree'
                  : 'homologationBientotExpiree',
              metadonnees: {
                idService,
                dateExpirationHomologation: dossier.dateProchaineHomologation(),
              },
            })
          );
        })
      )
    );
  };
