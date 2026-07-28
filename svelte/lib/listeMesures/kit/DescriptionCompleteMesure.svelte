<script lang="ts">
  import DescriptionLongueMesure from '../../ui/DescriptionLongueMesure.svelte';
  import type { ModeleDeMesure } from '../listeMesures.d';

  interface Props {
    modeleDeMesure: Omit<ModeleDeMesure, 'type' | 'idsServicesAssocies'>;
  }

  let { modeleDeMesure }: Props = $props();
</script>

<DescriptionLongueMesure description={modeleDeMesure.descriptionLongue} />
