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
      singulierPluriel(
        'Vous avez reçu <b>une mention</b> dans un commentaire.',
        `Vous avez reçu <b>${nombresParType.mentionDansMesure} mentions</b> dans des commentaires.`,
        nombresParType.mentionDansMesure || 0
      );

    const formatteResponsableMesure = (
      nombresParType: NombreNotificationsParType
    ) =>
      singulierPluriel(
        "Vous êtes désormais responsable d'<b>une mesure</b>.",
        `Vous êtes désormais responsable de <b>${nombresParType.responsableMesure} mesures</b>.`,
        nombresParType.responsableMesure || 0
      );

    const genereContenuPourUtilisateur = (
      idUtilisateur: UUID,
      nombresParType: NombreNotificationsParType
    ): string[] =>
      Object.entries(nombresParType)
        .map(([typeNotification]) => {
          if (
            tousUtilisateurs.get(idUtilisateur)!.preferencesRecapitulatif()[
              typeNotification as IdNotificationTransactionnelle
            ]
          ) {
            if (typeNotification === 'mentionDansMesure') {
              return formatteMentionDansMesure(nombresParType);
            }
            if (typeNotification === 'responsableMesure') {
              return formatteResponsableMesure(nombresParType);
            }
          }
          return undefined;
        })
        .filter(Boolean) as string[];

    return Object.fromEntries(
      toutesNotifications
        .entries()
        .filter(([idUtilisateur]) => tousUtilisateurs.has(idUtilisateur))
        .map(([idUtilisateur, nombresParType]) => [
          tousUtilisateurs.get(idUtilisateur)!.email,
          genereContenuPourUtilisateur(idUtilisateur, nombresParType).join(
            '<br>'
          ),
        ])
        .filter(([, contenu]) => contenu.length > 0)
    );
  }
}
