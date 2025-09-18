<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChampDeSaisie from '../../../ui/ChampDeSaisie.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = $leBrouillon.presentation.trim().length > 0;
</script>

<label for="presentation" class="titre-question">
  Présentez votre service en quelques lignes*
  <ChampDeSaisie
    label=""
    tailleMinimale={5}
    bind:contenu={$leBrouillon.presentation}
    on:blur={() =>
      emetEvenement('champModifie', {
        presentation: $leBrouillon.presentation,
      })}
  />
</label>
