<script lang="ts">
  import type { ActiviteMesure } from '../../mesure.d';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  interface Props {
    activite: ActiviteMesure;
  }

  let { activite }: Props = $props();
</script>

<div>
  L'échéance de la <DesignationMesureActivite {activite} /> a été supprimée
</div>
