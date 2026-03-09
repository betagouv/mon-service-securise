<script lang="ts">
  import { run } from 'svelte/legacy';

  import { brouillonEstCompletStore } from '../../creationV2/etapes/brouillonEstComplet.store';
  import ResumeDuServiceLectureSeule from '../../creationV2/etapes/resume/ResumeDuServiceLectureSeule.svelte';
  import { resume } from '../../creationV2/etapes/resume/resume.store';
  import BrouillonDeServiceEditable from '../../creationV2/etapes/BrouillonDeServiceEditable.svelte';
  import { leBrouillon } from '../../creationV2/etapes/brouillon.store';
  import type { MiseAJour } from '../../creationV2/creationV2.api';
  import { metsAJourSimulation } from '../simulationv2.api';

  let lectureSeule = $state(true);

  interface Props {
    estComplete: boolean;
  }

  let { estComplete = $bindable() }: Props = $props();
  run(() => {
    estComplete = $brouillonEstCompletStore;
  });

  const metsAJour = async (e: CustomEvent<MiseAJour>) => {
    await metsAJourSimulation($leBrouillon.id!, e.detail);
  };
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
      on:champModifie={metsAJour}
    />
  </div>
{/if}

<style lang="scss">
  .conteneur-bouton-modifier {
    margin-left: auto;
  }
</style>
