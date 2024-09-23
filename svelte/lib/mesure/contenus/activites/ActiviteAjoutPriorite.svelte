<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import TagPrioriteMesure from '../../../ui/TagPrioriteMesure.svelte';
  import type { PrioriteMesure, ReferentielPriorite } from '../../../ui/types';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  export let activite: ActiviteMesure;
  export let priorites: ReferentielPriorite;

  const details = <DetailsAjoutPropriete>activite.details;
  const priorite: PrioriteMesure = <PrioriteMesure>details.nouvelleValeur;
</script>

<div>
  La priorité de la <DesignationMesureActivite {activite} /> est
  <TagPrioriteMesure {priorites} {priorite} />
</div>
