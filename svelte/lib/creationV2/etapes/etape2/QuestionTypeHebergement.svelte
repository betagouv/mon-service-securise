<script lang="ts">
  import { tick } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import type { ActiviteExternalisee } from '../../creationV2.types';
  import CaseACocher from '../../../ui/CaseACocher.svelte';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  // eslint-disable-next-line no-useless-assignment
  let { estComplete = $bindable(), onChampModifie }: Props = $props();
  $effect(() => {
    estComplete = !!$leBrouillon.typeHebergement;
  });

  const externaliseSiNecessaire = (e: Event) => {
    const aucune = [] as ActiviteExternalisee[];
    const toutes = Object.keys(
      questionsV2.activiteExternalisee
    ) as ActiviteExternalisee[];

    const { value: typeHebergement } = e.target as HTMLInputElement;

    $leBrouillon.activitesExternalisees =
      typeHebergement === 'saas' ? toutes : aucune;

    onChampModifie({
      typeHebergement: $leBrouillon.typeHebergement,
      activitesExternalisees: $leBrouillon.activitesExternalisees,
    });
  };

  const metsAJourActivitesExternalisees = async () => {
    await tick();
    onChampModifie({
      activitesExternalisees: $leBrouillon.activitesExternalisees,
    });
  };
</script>

<div class="selection-type-hebergement">
  <span class="titre-question">
    Quel type de cloud/hébergement utilisez-vous ?*
  </span>

  <span class="indication">Sélectionnez une réponse</span>

  {#each Object.entries(questionsV2.typeHebergement) as [idType, { nom }] (idType)}
    <Radio
      id={idType}
      {nom}
      bind:valeur={$leBrouillon.typeHebergement}
      onchange={externaliseSiNecessaire}
    />
  {/each}
</div>

<div
  class="titre-question activites-externalisees"
  class:indisponible={!$leBrouillon.typeHebergement}
>
  <span class="titre-question-activites"
    >Quelles activités du projet sont entièrement externalisées ?</span
  >
  {#each Object.entries(questionsV2.activiteExternalisee) as [idActivite, { nom, exemple }] (idActivite)}
    {@const actif =
      !!$leBrouillon.typeHebergement && $leBrouillon.typeHebergement !== 'saas'}
    <div class="conteneur-case-avec-exemple">
      <CaseACocher
        id={idActivite}
        {actif}
        bind:valeurs={$leBrouillon.activitesExternalisees}
        label={nom}
        onchange={async () => await metsAJourActivitesExternalisees()}
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
    font-weight: normal;
    margin-left: 33px;

    &.inactif {
      opacity: 0.7;
    }
  }

  .selection-type-hebergement {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 586px;
  }

  .indication {
    font-size: 0.75rem;
    line-height: 1.15rem;
    color: #666;
    font-weight: normal;
    margin-top: 8px;
  }
</style>
