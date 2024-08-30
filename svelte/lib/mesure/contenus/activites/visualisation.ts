import type { ActiviteMesure, TypeActiviteMesure } from '../../mesure.d';
import ActiviteAjoutPriorite from './ActiviteAjoutPriorite.svelte';
import ActiviteMiseAJourPriorite from './ActiviteMiseAJourPriorite.svelte';
import ActiviteInconnue from './ActiviteInconnue.svelte';
import type { SvelteComponent } from 'svelte';

export type VisualisationActivite = {
  titre: string;
  composantContenu: typeof SvelteComponent;
};

const visualisationsParType: Partial<
  Record<TypeActiviteMesure, VisualisationActivite>
> = {
  ajoutPriorite: {
    titre: 'Priorité',
    composantContenu: ActiviteAjoutPriorite,
  },
  miseAJourPriorite: {
    titre: 'Modification de la priorité',
    composantContenu: ActiviteMiseAJourPriorite,
  },
};

export const obtientVisualisation = (
  activite: ActiviteMesure
): VisualisationActivite =>
  visualisationsParType[activite.type] || {
    titre: 'Activité inconnue',
    composantContenu: ActiviteInconnue,
  };
