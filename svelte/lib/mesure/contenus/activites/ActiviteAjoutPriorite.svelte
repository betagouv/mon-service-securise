<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import TagPrioriteMesure from '../../../ui/TagPrioriteMesure.svelte';
  import type { PrioriteMesure, ReferentielPriorite } from '../../../ui/types';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  interface Props {
    activite: ActiviteMesure;
    priorites: ReferentielPriorite;
  }

  let { activite, priorites }: Props = $props();

  let details = $derived(activite.details as DetailsAjoutPropriete);
  let priorite = $derived(details.nouvelleValeur as PrioriteMesure);
</script>

<div>
  La priorité de la <DesignationMesureActivite {activite} /> est
  <TagPrioriteMesure {priorites} {priorite} />
</div>
