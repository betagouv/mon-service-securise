<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from './CheckboxIllustree.svelte';
  import type { MiseAJour } from '../../creationV2.api';
  import type { SpecificiteProjet } from '../../creationV2.types';
  import { leBrouillon } from '../brouillon.store';

  export let estComplete: boolean;

  estComplete = true;

  const illustrations: Record<SpecificiteProjet, string> = {
    postesDeTravail: 'postesDeTravail.svg',
    accesPhysiqueAuxBureaux: 'accesPhysiqueAuxBureaux.svg',
    accesPhysiqueAuxSallesTechniques: 'accesPhysiqueAuxSallesTechniques.svg',
    annuaire: 'annuaire.svg',
    dispositifDeSignatureElectronique: 'dispositifDeSignatureElectronique.svg',
    echangeOuReceptionEmails: 'echangeOuReceptionEmails.svg',
  };

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: emetEvenement('champModifie', {
    specificitesProjet: $leBrouillon.specificitesProjet,
  });

  const specificiteProjet = Object.entries(questionsV2.specificiteProjet) as [
    SpecificiteProjet,
    { nom: string; exemple: string },
  ][];
</script>

<label for="specificite-projet" class="titre-question">
  L'une ou plusieurs des spécificités suivantes sont-elles incluses dans le
  périmètre de l'homologation ?

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>
  {#each specificiteProjet as [idType, details]}
    {@const nomImage = illustrations[idType]}
    <CheckboxIllustree
      id={idType}
      nomGroupe="specificite-projet"
      bind:valeurs={$leBrouillon.specificitesProjet}
      {details}
      illustration="/statique/assets/images/specificiteProjet/{nomImage}"
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
