<script lang="ts">
  import ChampTexte from '../../../ui/ChampTexte.svelte';
  import { createEventDispatcher } from 'svelte';

  export let estComplete: boolean;
  export let valeur: string;
  const emetEvenement = createEventDispatcher<{
    champModifie: string | number;
  }>();

  $: estComplete = /^\d{14}$/.test(valeur);
</script>

<label for="nom-service">
  Quel est le nom ou siret de l’organisation ?
  <ChampTexte
    id="siret"
    nom="siret"
    bind:valeur
    on:blur={() => emetEvenement('champModifie', valeur)}
  />
</label>
