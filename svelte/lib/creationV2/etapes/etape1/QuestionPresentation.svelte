<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChampDeSaisie from '../../../ui/ChampDeSaisie.svelte';

  export let estComplete: boolean;
  export let valeur: string;
  const emetEvenement = createEventDispatcher<{ champModifie: string }>();

  $: estComplete = valeur ? valeur.trim().length > 0 : false;
</script>

<label for="presentation">
  Présentez votre service en quelques lignes*
  <ChampDeSaisie
    label=""
    tailleMinimale={5}
    bind:contenu={valeur}
    on:blur={() => emetEvenement('champModifie', valeur)}
  />
</label>
