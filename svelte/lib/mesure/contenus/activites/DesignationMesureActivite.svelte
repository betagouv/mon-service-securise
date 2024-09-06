<script lang="ts">
  import type { ActiviteMesure } from '../../mesure.d';

  export let activite: ActiviteMesure;
</script>

{#if activite.identifiantNumeriqueMesure}
  <b>mesure #{activite.identifiantNumeriqueMesure}</b>
{:else}
  mesure
{/if}
