<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import TagEcheanceMesure from '../../../ui/TagEcheanceMesure.svelte';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  interface Props {
    activite: ActiviteMesure;
  }

  let { activite }: Props = $props();

  let details = $derived(activite.details as DetailsAjoutPropriete);
  let echeance = $derived(new Date(details.nouvelleValeur));
</script>

<div>
  <div>
    L'échéance de la <DesignationMesureActivite {activite} /> a été fixée au
  </div>
  <div>
    <TagEcheanceMesure {echeance} />
  </div>
</div>
