import { IdNotificationTransactionnelle } from '../referentiel.types.js';
import {
  NombreNotificationsParType,
  singulierPluriel,
} from './rapportHebdomadaire.js';

type FormatteNotification = (
  nombresParType: NombreNotificationsParType
) => string;

export const formatteursNotifications: Record<
  IdNotificationTransactionnelle,
  FormatteNotification
> = {
  mentionDansMesure: (nombres) =>
    singulierPluriel(
      'Vous avez reçu <b>une mention</b> dans un commentaire.',
      `Vous avez reçu <b>${nombres.mentionDansMesure} mentions</b> dans des commentaires.`,
      nombres.mentionDansMesure ?? 0
    ),

  responsableMesure: (nombres) =>
    singulierPluriel(
      "Vous êtes désormais responsable d'<b>une mesure</b>.",
      `Vous êtes désormais responsable de <b>${nombres.responsableMesure} mesures</b>.`,
      nombres.responsableMesure ?? 0
    ),

  echeanceMesureBientotExpiree: (nombres) =>
    singulierPluriel(
      '<b>Une mesure</b> arrive à échéance dans les deux prochaines semaines.',
      `<b>${nombres.echeanceMesureBientotExpiree} mesures</b> arrivent à échéance dans les deux prochaines semaines.`,
      nombres.echeanceMesureBientotExpiree ?? 0
    ),
};
