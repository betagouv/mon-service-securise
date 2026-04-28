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

  // eslint-disable-next-line no-useless-assignment
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

<label for="volumetrie-donnees" class="titre-question">
  Quel est le volume des données traitées au sein du système d’information ?*

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
