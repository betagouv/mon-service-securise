import { DepotDonnees } from '../../depotDonnees.interface.js';
import { UUID } from '../../typesBasiques.js';

export const supprimeNotificationsTransactionnelles =
  ({ depotDonnees }: { depotDonnees: DepotDonnees }) =>
  async ({ idService }: { idService: UUID }) => {
    if (!idService)
      throw new Error(
        "Impossible de supprimer les notifications transactionnelles d'un service sans avoir l'ID du service en paramètre."
      );

    await depotDonnees.supprimeNotificationsTransactionnellesDuService(
      idService
    );
  };
