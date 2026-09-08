import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';
import Dossier from '../../modeles/dossier.js';
import { Contributeur } from '../../modeles/contributeur.js';
import { NotificationTransactionnelle } from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';

export const consigneNotificationsExpirationHomologation =
  ({ depotDonnees }: { depotDonnees: DepotDonnees }) =>
  async ({ idService, dossier }: { idService: UUID; dossier: Dossier }) => {
    const service = await depotDonnees.service(idService);
    const proprietaires = service!.contributeurs.filter(
      (c: Contributeur) => c.estProprietaire
    );
    await Promise.all(
      proprietaires.map((c: Contributeur) =>
        depotDonnees.sauvegardeNotificationTransactionnelle(
          NotificationTransactionnelle.nouveau({
            idActeur: c.idUtilisateur,
            idDestinataire: c.idUtilisateur,
            date: dossier.dateProchaineHomologation(),
            type: 'homologationExpiree',
            metadonnees: {
              idService,
            },
          })
        )
      )
    );
  };
