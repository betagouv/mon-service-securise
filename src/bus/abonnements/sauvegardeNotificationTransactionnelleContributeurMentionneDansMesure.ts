import ActiviteMesure from '../../modeles/activiteMesure.js';
import { DepotDonneesNotificationsTransactionnelles } from '../../depots/depotDonneesNotificationsTransactionnelles.js';
import { NotificationTransactionnelle } from '../../modeles/notificationsTransactionnelles/notificationTransactionnelle.js';
import { UUID } from '../../typesBasiques.js';

const MENTION_UUID =
  /@\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]/gi;

export const extraireMentions = (texte: string): UUID[] =>
  [...texte.matchAll(MENTION_UUID)].map(([, uuid]) => uuid as UUID);

export const sauvegardeNotificationTransactionnelleContributeurMentionneDansMesure =

    ({
      depotDonnees,
    }: {
      depotDonnees: DepotDonneesNotificationsTransactionnelles;
    }) =>
    async ({ activiteMesure }: { activiteMesure: ActiviteMesure }) => {
      const mentions = extraireMentions(
        activiteMesure.details.contenu as string
      );

      await depotDonnees.sauvegardeNotificationTransactionnelle(
        NotificationTransactionnelle.nouveau({
          idActeur: activiteMesure.idActeur,
          idDestinataire: mentions[0],
          date: activiteMesure.date,
          type: 'mentionDansMesure',
          metadonnees: {
            idService: activiteMesure.idService,
            idMesure: activiteMesure.idMesure,
            typeMesure: activiteMesure.typeMesure,
          },
        })
      );
    };
