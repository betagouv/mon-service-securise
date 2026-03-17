<script lang="ts">
  import Radio from '../../Radio.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import type { LocalisationDonneesTraitees } from '../../creationV2.types';
  import type { ChangeEventHandler } from 'svelte/elements';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  $effect(() => {
    estComplete = !!$leBrouillon.localisationDonneesTraitees;
  });

  const metsAJour: ChangeEventHandler<HTMLInputElement> = (e) => {
    onChampModifie({
      localisationDonneesTraitees: e.currentTarget
        .value as LocalisationDonneesTraitees,
    });
  };

  const illustrations: Record<LocalisationDonneesTraitees, string> = {
    UE: 'UE.svg',
    horsUE: 'horsUE.svg',
  };

  const localisations = Object.entries(
    questionsV2.localisationDonneesTraitees
  ) as Array<[LocalisationDonneesTraitees, { nom: string }]>;
</script>

<label for="localisations-donnees-traitees" class="titre-question">
  Où sont localisées les données traitées ?*
  <span class="indication">Sélectionnez une réponse</span>
  {#each localisations as [idType, { nom }] (idType)}
    {@const illustration = `/statique/assets/images/localisationDonneesTraitees/${illustrations[idType]}`}
    <Radio
      id={idType}
      {nom}
      {illustration}
      bind:valeur={$leBrouillon.localisationDonneesTraitees}
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
