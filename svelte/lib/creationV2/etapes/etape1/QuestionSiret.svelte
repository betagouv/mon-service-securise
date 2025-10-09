<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import ChampOrganisation from '../../../ui/ChampOrganisation.svelte';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = /^\d{14}$/.test($leBrouillon.siret);

  $: {
    if (estComplete)
      emetEvenement('champModifie', { siret: $leBrouillon.siret });
  }
</script>

<ChampOrganisation
  label="Quel est le nom ou siret de l’organisation ?*"
  bind:siret={$leBrouillon.siret}
/>
