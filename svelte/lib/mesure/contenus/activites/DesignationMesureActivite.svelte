<script lang="ts">
  import type { ActiviteMesure } from '../../mesure.d';

  interface Props {
    activite: ActiviteMesure;
  }

  let { activite }: Props = $props();
</script>

{#if activite.identifiantNumeriqueMesure}
  <b>mesure #{activite.identifiantNumeriqueMesure}</b>
{:else}
  mesure
{/if}
