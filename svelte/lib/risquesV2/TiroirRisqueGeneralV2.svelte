<script lang="ts">
  import type { Risque } from './risquesV2.d';
  import BadgesTiroirRisqueV2 from './BadgesTiroirRisqueV2.svelte';

  interface Props {
    risque: Risque;
  }

  let { risque }: Props = $props();

  export const titre = risque.intitule;
  export const sousTitre = '';
  export const composantEntete = BadgesTiroirRisqueV2;
</script>
