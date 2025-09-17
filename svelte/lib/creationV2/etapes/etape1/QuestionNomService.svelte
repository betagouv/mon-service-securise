<script lang="ts">
  import ChampTexte from '../../../ui/ChampTexte.svelte';
  import { createEventDispatcher } from 'svelte';

  export let estComplete: boolean;
  export let valeur: string;
  const emetEvenement = createEventDispatcher<{
    champModifie: string | number;
  }>();

  $: estComplete = valeur ? valeur.trim().length > 0 : false;
</script>

<label for="nom-service" class="titre-question">
  Quel est le nom de votre service ?
  <ChampTexte
    id="nom-service"
    nom="nom-service"
    bind:valeur
    on:blur={() => emetEvenement('champModifie', valeur)}
  />
</label>
