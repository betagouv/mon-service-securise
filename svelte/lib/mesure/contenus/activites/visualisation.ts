import type { ActiviteMesure, TypeActiviteMesure } from '../../mesure.d';
import ActiviteAjoutPriorite from './ActiviteAjoutPriorite.svelte';
import ActiviteMiseAJourPriorite from './ActiviteMiseAJourPriorite.svelte';
import type { SvelteComponent } from 'svelte';
import ActiviteAjoutStatut from './ActiviteAjoutStatut.svelte';
import ActiviteMiseAJourStatut from './ActiviteMiseAJourStatut.svelte';
import ActiviteAjoutEcheance from './ActiviteAjoutEcheance.svelte';
import ActiviteMiseAJourEcheance from './ActiviteMiseAJourEcheance.svelte';
import ActiviteSuppressionEcheance from './ActiviteSuppressionEcheance.svelte';
import ActiviteAjoutResponsable from './ActiviteAjoutResponsable.svelte';
import ActiviteSuppressionResponsable from './ActiviteSuppressionResponsable.svelte';
import ActiviteAjoutCommentaire from './ActiviteAjoutCommentaire.svelte';

export type VisualisationActivite = {
  titre: string;
  composantContenu: typeof SvelteComponent;
  aBesoinPriorites?: boolean;
  aBesoinStatuts?: boolean;
};

const visualisationsParType: Record<TypeActiviteMesure, VisualisationActivite> =
  {
    ajoutPriorite: {
      titre: 'Priorité',
      composantContenu: ActiviteAjoutPriorite,
      aBesoinPriorites: true,
    },
    miseAJourPriorite: {
      titre: 'Modification de la priorité',
      composantContenu: ActiviteMiseAJourPriorite,
      aBesoinPriorites: true,
    },
    ajoutStatut: {
      titre: 'Statut',
      composantContenu: ActiviteAjoutStatut,
      aBesoinStatuts: true,
    },
    miseAJourStatut: {
      titre: 'Modification du statut',
      composantContenu: ActiviteMiseAJourStatut,
      aBesoinStatuts: true,
    },
    ajoutEcheance: {
      titre: 'Échéance',
      composantContenu: ActiviteAjoutEcheance,
    },
    miseAJourEcheance: {
      titre: "Modification d'échéance",
      composantContenu: ActiviteMiseAJourEcheance,
    },
    suppressionEcheance: {
      titre: "Suppression de l'échéance",
      composantContenu: ActiviteSuppressionEcheance,
    },
    ajoutResponsable: {
      titre: 'Attribution à un·e responsable',
      composantContenu: ActiviteAjoutResponsable,
    },
    suppressionResponsable: {
      titre: "Suppression de l'attribution",
      composantContenu: ActiviteSuppressionResponsable,
    },
    ajoutCommentaire: {
      titre: 'Commentaire',
      composantContenu: ActiviteAjoutCommentaire,
    },
  };

export const obtientVisualisation = (
  activite: ActiviteMesure
): VisualisationActivite => visualisationsParType[activite.type];
