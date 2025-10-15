<script lang="ts">
  import ResumeDuServiceLectureSeule from './ResumeDuServiceLectureSeule.svelte';
  import BrouillonDeServiceEditable from '../BrouillonDeServiceEditable.svelte';
  import { brouillonEstCompletStore } from '../brouillonEstComplet.store';
  import { resume } from './resume.store';
  import { onMount } from 'svelte';
  import { rechercheOrganisation } from '../../../ui/rechercheOrganisation';
  import type { Entite } from '../../../ui/types';

  let lectureSeule = true;

  export let estComplete: boolean;
  $: estComplete = $brouillonEstCompletStore;

  let entite: Entite | null = null;
  onMount(async () => {
    entite = (await rechercheOrganisation($resume.siret as string))[0];
  });
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
  <ResumeDuServiceLectureSeule donnees={$resume} {entite} />
{:else}
  <div class="resume-editable">
    <BrouillonDeServiceEditable />
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
