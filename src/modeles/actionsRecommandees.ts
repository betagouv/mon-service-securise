import { Autorisation } from './autorisations/autorisation.js';
import { Droits } from './autorisations/gestionDroits.js';

export const ToutesActionsRecommandees: Record<
  string,
  { id: string; droitsNecessaires: Partial<Droits> | string }
> = {
  METTRE_A_JOUR: {
    id: 'mettreAJour',
    droitsNecessaires: Autorisation.DROITS_EDITER_DESCRIPTION,
  },
  CONTINUER_HOMOLOGATION: {
    id: 'continuerHomologation',
    droitsNecessaires: Autorisation.DROITS_EDITER_HOMOLOGATION,
  },
  AUGMENTER_INDICE_CYBER: {
    id: 'augmenterIndiceCyber',
    droitsNecessaires: Autorisation.DROITS_EDITER_MESURES,
  },
  TELECHARGER_ENCART_HOMOLOGATION: {
    id: 'telechargerEncartHomologation',
    droitsNecessaires: Autorisation.DROITS_VOIR_STATUT_HOMOLOGATION,
  },
  HOMOLOGUER_A_NOUVEAU: {
    id: 'homologuerANouveau',
    droitsNecessaires: Autorisation.DROITS_EDITER_HOMOLOGATION,
  },
  HOMOLOGUER_SERVICE: {
    id: 'homologuerService',
    droitsNecessaires: Autorisation.DROITS_EDITER_HOMOLOGATION,
  },
  INVITER_CONTRIBUTEUR: {
    id: 'inviterContributeur',
    droitsNecessaires: Autorisation.DROIT_INVITER_CONTRIBUTEUR,
  },
} as const;

export type ActionRecommandee =
  (typeof ToutesActionsRecommandees)[keyof typeof ToutesActionsRecommandees];
