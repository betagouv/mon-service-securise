<script lang="ts">
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { VolumetrieDonneesTraitees } from '../../creationV2.types';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  $effect(() => {
    estComplete = !!$leBrouillon.volumetrieDonneesTraitees;
  });

  const metsAJour: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChampModifie({
      volumetrieDonneesTraitees: e.currentTarget
        .value as VolumetrieDonneesTraitees,
    });
  };
</script>

<div>
  <span class="titre-question"
    >Quel est le volume des données traitées au sein du système d’information ?*</span
  >

  <span class="indication">Sélectionnez une réponse</span>
  {#each Object.entries(questionsV2.volumetrieDonneesTraitees) as [idType, { nom, description }] (idType)}
    <Radio
      id={idType}
      {nom}
      exemple={description}
      bind:valeur={$leBrouillon.volumetrieDonneesTraitees}
      onchange={metsAJour}
    />
  {/each}
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 586px;

    .indication {
      font-size: 0.75rem;
      line-height: 1.15rem;
      color: #666;
      font-weight: normal;
      margin-top: 8px;
    }
  }
</style>
