<script lang="ts">
  import ResumeDuServiceLectureSeule from './ResumeDuServiceLectureSeule.svelte';
  import BrouillonDeServiceEditable from '../BrouillonDeServiceEditable.svelte';
  import { brouillonEstCompletStore } from '../brouillonEstComplet.store';
  import { resume } from './resume.store';
  import { metsAJourBrouillonService } from '../../creationV2.api';
  import { leBrouillon } from '../brouillon.store';

  let lectureSeule = $state(true);

  interface Props {
    estComplete: boolean;
  }

  let { estComplete = $bindable() }: Props = $props();
  $effect(() => {
    estComplete = $brouillonEstCompletStore;
  });
</script>

{#if lectureSeule}
  <div class="conteneur-bouton-modifier">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <lab-anssi-bouton
      titre="Modifier le service"
      variante="tertiaire"
      taille="md"
      icone="edit-line"
      positionIcone="droite"
      onclick={() => (lectureSeule = false)}
    ></lab-anssi-bouton>
  </div>
  <ResumeDuServiceLectureSeule donnees={$resume} />
{:else}
  <div class="resume-editable">
    <BrouillonDeServiceEditable
      bind:donnees={$leBrouillon}
      seulementNomServiceEditable={false}
      on:champModifie={async (e) => {
        if ($leBrouillon.id)
          await metsAJourBrouillonService($leBrouillon.id, e.detail);
      }}
    />
  </div>
{/if}

<style lang="scss">
  .conteneur-bouton-modifier {
    margin-left: auto;
  }
</style>
