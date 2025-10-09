<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import type { ActiviteExternalisee } from '../../creationV2.types';
  import CaseACocher from '../../../ui/CaseACocher.svelte';

  export let estComplete: boolean;
  $: estComplete = !!$leBrouillon.typeHebergement;

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  const externaliseSiNecessaire = (e: Event) => {
    const aucune = [] as ActiviteExternalisee[];
    const toutes = Object.keys(
      questionsV2.activiteExternalisee
    ) as ActiviteExternalisee[];

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
  Quel type de cloud/hébergement utilisez-vous ?*

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

<div
  class="titre-question activites-externalisees"
  class:indisponible={!$leBrouillon.typeHebergement}
>
  <span class="titre-question-activites"
    >Quelles activités du projet sont entièrement externalisées ?</span
  >
  {#each Object.entries(questionsV2.activiteExternalisee) as [idActivite, { nom, exemple }]}
    {@const actif =
      !!$leBrouillon.typeHebergement && $leBrouillon.typeHebergement !== 'saas'}
    <div class="conteneur-case-avec-exemple">
      <CaseACocher
        id={idActivite}
        {actif}
        bind:valeurs={$leBrouillon.activitesExternalisees}
        label={nom}
        on:change={async () => await metsAJourActivitesExternalisees()}
      />
      {#if exemple}
        <span class="indication-libelle" class:inactif={!actif}>{exemple}</span>
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  .titre-question-activites {
    margin-bottom: 8px;
  }
  .conteneur-case-avec-exemple {
    display: flex;
    flex-direction: column;
  }
  .indication-libelle {
    font-size: 0.75rem;
    line-height: 1.25rem;
    color: #666;
    font-weight: normal;
    margin-left: 33px;

    &.inactif {
      opacity: 0.5;
    }
  }

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
