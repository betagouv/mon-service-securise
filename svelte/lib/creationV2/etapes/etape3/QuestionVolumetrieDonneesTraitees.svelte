<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = !!$leBrouillon.volumetrieDonneesTraitees;

  $: emetEvenement('champModifie', {
    volumetrieDonneesTraitees: $leBrouillon.volumetrieDonneesTraitees,
  });
</script>

<label for="volumetrie-donnees" class="titre-question">
  Quel est le volume des données traitées au sein du système d’information ?*

  <span class="indication">Sélectionnez une réponse</span>
  {#each Object.entries(questionsV2.volumetrieDonneesTraitees) as [idType, { nom, description }]}
    <Radio
      id={idType}
      {nom}
      exemple={description}
      bind:valeur={$leBrouillon.volumetrieDonneesTraitees}
    />
  {/each}
</label>

<style lang="scss">
  label {
    .indication {
      font-size: 0.75rem;
      line-height: 1.15rem;
      color: #666;
      font-weight: normal;
      margin-top: 8px;
    }
  }
</style>
