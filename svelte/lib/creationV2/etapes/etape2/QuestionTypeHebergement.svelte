<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import Radio from '../../Radio.svelte';

  export let estComplete: boolean;
  export let valeur: string = '';

  const dispatch = createEventDispatcher<{ champModifie: string }>();

  $: estComplete = !!valeur;

  $: if (valeur) dispatch('champModifie', valeur);
</script>

<label for="type-hebergement" class="titre-question">
  Quel type de cloud utilisez-vous ?*

  <span class="indication">Sélectionnez une réponse</span>

  {#each Object.entries(questionsV2.typeHebergement) as [idType, { nom }]}
    <Radio id={idType} {nom} bind:valeur />
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
