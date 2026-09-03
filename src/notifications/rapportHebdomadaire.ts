import { IdNotificationTransactionnelle } from '../referentiel.types.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import Utilisateur from '../modeles/utilisateur.js';
import { UUID } from '../typesBasiques.js';
import { formatteursNotifications } from './formatteursNotifications.js';

export type NombreNotificationsParType = Partial<
  Record<IdNotificationTransactionnelle, number>
>;

export const singulierPluriel = (
  chaineSingulier: string,
  chainePluriel: string,
  nombre: number
) => (nombre > 1 ? chainePluriel : chaineSingulier);

export class RapportHebdomadaire {
  constructor(
    private readonly configuration: {
      depotDonnees: DepotDonnees;
    }
  ) {}

  async donnees(): Promise<Record<string, string>> {
    const toutesNotifications =
      await this.configuration.depotDonnees.lisRapportNotifications();

    const utilisateurs = await this.configuration.depotDonnees.utilisateurs(
      toutesNotifications.keys().toArray()
    );
    const utilisateursParId = new Map<UUID, Utilisateur>(
      utilisateurs.map((utilisateur) => [utilisateur.id, utilisateur])
    );

    const genereContenuPourUtilisateur = (
      utilisateur: Utilisateur,
      nombresParType: NombreNotificationsParType
    ): string[] => {
      const preferences = utilisateur.preferencesRecapitulatif();

      return Object.keys(nombresParType).flatMap((type) => {
        const typeNotification = type as IdNotificationTransactionnelle;
        if (!preferences[typeNotification]) return [];

        return [formatteursNotifications[typeNotification](nombresParType)];
      });
    };

    return Object.fromEntries(
      toutesNotifications
        .entries()
        .flatMap(([idUtilisateur, nombresParType]) => {
          const utilisateur = utilisateursParId.get(idUtilisateur);
          if (!utilisateur) return [];

          const contenu = genereContenuPourUtilisateur(
            utilisateur,
            nombresParType
          ).join('<br>');

          return contenu ? [[utilisateur.email, contenu]] : [];
        })
    );
  }
}
