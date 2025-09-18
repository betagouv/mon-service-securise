<script lang="ts">
  import ChampTexte from '../../../ui/ChampTexte.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';

  export let estComplete: boolean;
  export let valeur: string;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = /^\d{14}$/.test(valeur);
</script>

<label for="siret" class="titre-question">
  Quel est le nom ou siret de l’organisation ?
  <ChampTexte
    id="siret"
    nom="siret"
    bind:valeur
    on:blur={() => emetEvenement('champModifie', { siret: valeur })}
  />
</label>
