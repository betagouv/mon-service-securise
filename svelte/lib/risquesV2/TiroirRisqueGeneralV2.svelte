<script lang="ts">
  import type { Risque } from './risquesV2.d';
  import BadgesTiroirRisqueV2 from './BadgesTiroirRisqueV2.svelte';
  import { untrack } from 'svelte';

  interface Props {
    risque: Risque;
  }

  let { risque }: Props = $props();

  export const titre = untrack(() => risque.intitule);
  export const sousTitre = '';
  export const composantEntete = BadgesTiroirRisqueV2;
  export const propsComposantEntete = untrack(() => ({ risque }));
</script>
