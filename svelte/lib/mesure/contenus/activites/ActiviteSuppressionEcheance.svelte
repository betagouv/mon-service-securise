<script lang="ts">
  import type { ActiviteMesure } from '../../mesure.d';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  export let activite: ActiviteMesure;
</script>

<div>
  L'échéance de la <DesignationMesureActivite {activite} /> a été supprimée
</div>
