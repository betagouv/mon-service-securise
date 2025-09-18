<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChampDeSaisie from '../../../ui/ChampDeSaisie.svelte';
  import type { MiseAJour } from '../../creationV2.api';

  export let estComplete: boolean;
  export let valeur: string;
  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = valeur ? valeur.trim().length > 0 : false;
</script>

<label for="presentation" class="titre-question">
  Présentez votre service en quelques lignes*
  <ChampDeSaisie
    label=""
    tailleMinimale={5}
    bind:contenu={valeur}
    on:blur={() => emetEvenement('champModifie', { presentation: valeur })}
  />
</label>
