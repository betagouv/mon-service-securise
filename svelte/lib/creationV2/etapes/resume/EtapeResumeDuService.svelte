<script lang="ts">
  import ResumeDuServiceLectureSeule from './ResumeDuServiceLectureSeule.svelte';
  import BrouillonDeServiceEditable from '../BrouillonDeServiceEditable.svelte';
  import { brouillonEstCompletStore } from '../brouillonEstComplet.store';

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
  <ResumeDuServiceLectureSeule />
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
  .conteneur-bouton-modifier {
    margin-left: auto;
  }
</style>
