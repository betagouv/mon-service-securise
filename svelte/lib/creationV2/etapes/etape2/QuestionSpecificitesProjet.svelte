<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';
  import CheckboxIllustree from './CheckboxIllustree.svelte';
  import type { MiseAJour } from '../../creationV2.api';

  export let estComplete: boolean;
  export let valeur: string[] = [];

  const illustrations: Record<
    keyof typeof questionsV2.specificiteProjet,
    string
  > = {
    postesDeTravail: 'postesDeTravail.svg',
    accesPhysiqueAuxBureaux: 'accesPhysiqueAuxBureaux.svg',
    accesPhysiqueAuxSallesTechniques: 'accesPhysiqueAuxSallesTechniques.svg',
    annuaire: 'annuaire.svg',
    dispositifDeSignatureElectronique: 'dispositifDeSignatureElectronique.svg',
    echangeOuReceptionEmails: 'echangeOuReceptionEmails.svg',
  };

  const emetEvenement = createEventDispatcher<{ champModifie: MiseAJour }>();

  $: if (valeur) emetEvenement('champModifie', { specificitesProjet: valeur });

  $: estComplete = true;

  const specificiteProjet = Object.entries(questionsV2.specificiteProjet) as [
    keyof typeof questionsV2.specificiteProjet,
    { nom: string; exemple: string },
  ][];
</script>

<label for="specificite-projet" class="titre-question">
  L'une ou plusieurs des spécificités suivantes sont-elles à sécuriser au sein
  du périmètre d'homologation ?

  <span class="indication">Sélectionnez une ou plusieurs réponses</span>
  {#each specificiteProjet as [idType, details]}
    {@const nomImage = illustrations[idType]}
    <CheckboxIllustree
      id={idType}
      bind:valeurs={valeur}
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
