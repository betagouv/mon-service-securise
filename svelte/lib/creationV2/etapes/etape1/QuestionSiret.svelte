<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { entiteDeUtilisateur, leBrouillon } from '../brouillon.store';
  import ChampOrganisation from '../../../ui/ChampOrganisation.svelte';
  import { brouillonAEteCreeStore } from '../../brouillonAEteCree.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  let doitForcerEvenement = false;

  onMount(() => {
    brouillonAEteCreeStore.subscribe((existe) => {
      if (!$leBrouillon.siret && $entiteDeUtilisateur) {
        doitForcerEvenement = true;
        $leBrouillon.siret = $entiteDeUtilisateur.siret;
      }
      if (existe && doitForcerEvenement && estComplete) {
        emetEvenement('champModifie', { siret: $leBrouillon.siret });
      }
    });
  });

  $: estComplete = !!$leBrouillon.id && /^\d{14}$/.test($leBrouillon.siret);

  $: {
    if (estComplete)
      emetEvenement('champModifie', { siret: $leBrouillon.siret });
  }
</script>

<label for="siret" class="titre-question">
  Quel est le nom ou siret de l’organisation ?*
</label>

{#key $leBrouillon.siret}
  <ChampOrganisation bind:siret={$leBrouillon.siret} />
{/key}
