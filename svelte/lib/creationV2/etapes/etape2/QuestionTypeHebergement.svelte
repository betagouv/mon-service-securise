<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: estComplete = !!$leBrouillon.typeHebergement;

  $: emetEvenement('champModifie', {
    typeHebergement: $leBrouillon.typeHebergement,
  });
</script>

<label for="type-hebergement" class="titre-question">
  Quel type de cloud utilisez-vous ?*

  <span class="indication">Sélectionnez une réponse</span>

  {#each Object.entries(questionsV2.typeHebergement) as [idType, { nom }]}
    <Radio id={idType} {nom} bind:valeur={$leBrouillon.typeHebergement} />
  {/each}
</label>

<label
  for="activites-externalisees"
  class="titre-question activites-externalisees"
>
  Quelles activités du projet sont entièrement externalisées ?

  <label>
    <input type="checkbox" />
    <span>
      <span class="libelle">L'administration technique</span>
      <span class="indication-libelle">Administration logique des serveurs</span
      >
    </span>
  </label>
  <label>
    <input type="checkbox" />
    <span>
      <span class="libelle">Le développement</span>
    </span>
  </label>
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

  .activites-externalisees {
    label {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 8px;
      input[type='checkbox'] {
        position: relative;
        top: 3px;
      }
      span {
        display: flex;
        flex-direction: column;
      }
    }
    .libelle {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #161616;
      font-weight: normal;
    }
    .indication-libelle {
      font-size: 0.75rem;
      line-height: 1.25rem;
      color: #666;
      font-weight: normal;
    }
  }
</style>
