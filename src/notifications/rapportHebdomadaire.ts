import { IdNotificationTransactionnelle } from '../referentiel.types.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import Utilisateur from '../modeles/utilisateur.js';
import { UUID } from '../typesBasiques.js';

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
    const utilisateurs: Utilisateur[] =
      await this.configuration.depotDonnees.utilisateurs(
        toutesNotifications.keys().toArray()
      );
    const tousUtilisateurs: Map<UUID, Utilisateur> = new Map(
      utilisateurs.map((u) => [u.id, u])
    );

    const formatteMentionDansMesure = (
      nombresParType: NombreNotificationsParType
    ) =>
      `Vous avez reçu ${nombresParType.mentionDansMesure} ${singulierPluriel('mention dans un commentaire.', 'mentions dans des commentaires.', nombresParType.mentionDansMesure || 0)}`;

    return Object.fromEntries(
      toutesNotifications
        .entries()
        .filter(([idUtilisateur]) => tousUtilisateurs.has(idUtilisateur))
        .filter(
          ([idUtilisateur]) =>
            tousUtilisateurs.get(idUtilisateur)!.preferencesRecapitulatif()
              .mentionDansMesure
        )
        .map(([idUtilisateur, nombresParType]) => [
          tousUtilisateurs.get(idUtilisateur)!.email,
          formatteMentionDansMesure(nombresParType),
        ])
    );
  }
}
