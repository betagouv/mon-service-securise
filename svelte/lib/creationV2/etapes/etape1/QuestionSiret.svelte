<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { entiteDeUtilisateur, leBrouillon } from '../brouillon.store';
  import ChampOrganisation from '../../../ui/ChampOrganisation.svelte';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  let doitForcerEvenement = false;
  if (!$leBrouillon.siret && $entiteDeUtilisateur) {
    doitForcerEvenement = true;
    $leBrouillon.siret = $entiteDeUtilisateur.siret;
  }

  onMount(() => {
    if (doitForcerEvenement && estComplete) {
      emetEvenement('champModifie', { siret: $leBrouillon.siret });
    }
  });

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
