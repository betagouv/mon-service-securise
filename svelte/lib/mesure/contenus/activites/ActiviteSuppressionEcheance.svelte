<script lang="ts">
  import type { ActiviteMesure } from '../../mesure.d';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  export let activite: ActiviteMesure;
  // eslint-disable-next-line svelte/valid-compile
  export let priorites, statuts;
</script>

<div>
  L'échéance de la <DesignationMesureActivite {activite} /> a été supprimée
</div>
