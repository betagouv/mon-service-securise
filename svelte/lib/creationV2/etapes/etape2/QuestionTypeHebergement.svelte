<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import type { ActiviteeExternalisee } from '../../creationV2.types';

  export let estComplete: boolean;
  $: estComplete = !!$leBrouillon.typeHebergement;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  const externaliseSiNecessaire = (e: Event) => {
    const aucune = [] as ActiviteeExternalisee[];
    const toutes = Object.keys(
      questionsV2.activiteExternalisee
    ) as ActiviteeExternalisee[];

    const { value: typeHebergement } = e.target as HTMLInputElement;

    $leBrouillon.activitesExternalisees =
      typeHebergement === 'saas' ? toutes : aucune;

    emetEvenement('champModifie', {
      typeHebergement: $leBrouillon.typeHebergement,
      activitesExternalisees: $leBrouillon.activitesExternalisees,
    });
  };

  const metsAJourActivitesExternalisees = async () => {
    await tick();
    emetEvenement('champModifie', {
      activitesExternalisees: $leBrouillon.activitesExternalisees,
    });
  };
</script>

<label for="type-hebergement" class="titre-question">
  Quel type de cloud utilisez-vous ?*

  <span class="indication">Sélectionnez une réponse</span>

  {#each Object.entries(questionsV2.typeHebergement) as [idType, { nom }]}
    <Radio
      id={idType}
      {nom}
      bind:valeur={$leBrouillon.typeHebergement}
      on:change={externaliseSiNecessaire}
    />
  {/each}
</label>

<label
  for="activites-externalisees"
  class="titre-question activites-externalisees"
  class:indisponible={$leBrouillon.typeHebergement === 'saas'}
>
  Quelles activités du projet sont entièrement externalisées ?
  {#each Object.entries(questionsV2.activiteExternalisee) as [idActivite, { nom, exemple }]}
    <label>
      <input
        type="checkbox"
        value={idActivite}
        bind:group={$leBrouillon.activitesExternalisees}
        on:change={async () => await metsAJourActivitesExternalisees()}
      />
      <span>
        <span class="libelle">{nom}</span>
        {#if exemple}<span class="indication-libelle">{exemple}</span>{/if}
      </span>
    </label>
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

  .activites-externalisees {
    &.indisponible {
      opacity: 0.55;
      pointer-events: none;

      input[type='checkbox'] {
        accent-color: grey;
      }
    }

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
