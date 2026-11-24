<script lang="ts">
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from './CheckboxIllustree.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import type { SpecificiteProjet } from '../../creationV2.types';
  import { leBrouillon } from '../brouillon.store';

  interface Props {
    estComplete: boolean;
    onChampModifie: (miseAJour: MiseAJour) => void;
  }

  let { estComplete = $bindable(), onChampModifie }: Props = $props();

  estComplete = true;

  const illustrations: Record<SpecificiteProjet, string> = {
    postesDeTravail: 'postesDeTravail.svg',
    accesPhysiqueAuxBureaux: 'accesPhysiqueAuxBureaux.svg',
    accesPhysiqueAuxSallesTechniques: 'accesPhysiqueAuxSallesTechniques.svg',
    annuaire: 'annuaire.svg',
    dispositifDeSignatureElectronique: 'dispositifDeSignatureElectronique.svg',
    echangeOuReceptionEmails: 'echangeOuReceptionEmails.svg',
  };

  $effect(() => {
    onChampModifie({
      specificitesProjet: $leBrouillon.specificitesProjet,
    });
  });

  const specificiteProjet = Object.entries(questionsV2.specificiteProjet) as [
    SpecificiteProjet,
    { nom: string; exemple: string },
  ][];
</script>

<div>
  <span class="titre-question">
    L'une ou plusieurs des spécificités suivantes sont-elles incluses dans le
    périmètre de l'homologation ?
  </span>

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>
  <fieldset>
    <legend>Spécificité</legend>
    {#each specificiteProjet as [idType, details] (idType)}
      {@const nomImage = illustrations[idType]}
      <CheckboxIllustree
        id={idType}
        nomGroupe="specificite-projet"
        bind:valeurs={$leBrouillon.specificitesProjet}
        {details}
        illustration="/statique/assets/images/specificiteProjet/{nomImage}"
      />
    {/each}
  </fieldset>
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 586px;

    fieldset {
      border: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;

      legend {
        display: none;
      }
    }

    .indication {
      font-size: 0.75rem;
      line-height: 1.15rem;
      color: #666;
      font-weight: normal;
      margin-top: 8px;
    }
  }
</style>
