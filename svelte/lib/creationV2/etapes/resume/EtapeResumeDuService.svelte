<script lang="ts">
  import ResumeDuServiceLectureSeule from './ResumeDuServiceLectureSeule.svelte';
  import ResumeDuServiceEditable from './ResumeDuServiceEditable.svelte';

  let lectureSeule = true;
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
  <ResumeDuServiceEditable />
{/if}

<style>
  .conteneur-bouton-modifier {
    margin-left: auto;
  }
</style>
