<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChampTexte from '../../../ui/ChampTexte.svelte';

  export let estComplete: boolean;
  export let valeur: string[];
  const emetEvenement = createEventDispatcher<{ champModifie: string[] }>();

  $: estComplete = valeur.every((v) => (v ? v.trim().length > 0 : false));
</script>

<label for="presentation">
  Quelle est l'URL de votre service?
  {#each valeur as url}
    <ChampTexte
      id="pointsAcces"
      nom="pointsAcces"
      bind:valeur={url}
      on:blur={() => emetEvenement('champModifie', [url])}
    />
  {/each}
</label>
