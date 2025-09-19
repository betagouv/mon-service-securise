<script lang="ts">
  import ChampTexte from '../../../ui/ChampTexte.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = /^\d{14}$/.test($leBrouillon.siret);
</script>

<label for="siret" class="titre-question">
  Quel est le nom ou siret de l’organisation ?
  <ChampTexte
    id="siret"
    nom="siret"
    bind:valeur={$leBrouillon.siret}
    on:blur={() => emetEvenement('champModifie', { siret: $leBrouillon.siret })}
  />
</label>
