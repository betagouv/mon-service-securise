<script lang="ts">
  import ResumeDuServiceLectureSeule from './ResumeDuServiceLectureSeule.svelte';
  import BrouillonDeServiceEditable from '../BrouillonDeServiceEditable.svelte';
  import { brouillonEstCompletStore } from '../brouillonEstComplet.store';
  import { resume } from './resume.store';
  import { onMount } from 'svelte';
  import { rechercheOrganisation } from '../../../ui/rechercheOrganisation';
  import type { Entite } from '../../../ui/types';
  import { metsAJourBrouillonService } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  let lectureSeule = true;

  export let estComplete: boolean;
  $: estComplete = $brouillonEstCompletStore;
</script>

{#if lectureSeule}
  <div class="conteneur-bouton-modifier">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Modifier le service"
      variante="tertiaire"
      taille="md"
      icone="edit-line"
      positionIcone="droite"
      on:click={() => (lectureSeule = false)}
    />
  </div>
  <ResumeDuServiceLectureSeule donnees={$resume} />
{:else}
  <div class="resume-editable">
    <BrouillonDeServiceEditable
      bind:donnees={$leBrouillon}
      seulementNomServiceEditable={false}
      on:champModifie={async (e) => {
        await metsAJourBrouillonService($leBrouillon.id, e.detail);
      }}
    />
  </div>
{/if}

<style lang="scss">
  .resume-editable {
    :global(.conteneur-avec-cadre) {
      padding-right: 248px !important;
    }
  }

  :global(.conteneur-avec-cadre) {
    max-width: 924px;
  }

  .conteneur-bouton-modifier {
    margin-left: auto;
  }
</style>
