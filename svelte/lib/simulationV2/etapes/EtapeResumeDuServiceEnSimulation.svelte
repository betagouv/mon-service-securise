<script lang="ts">
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

  // eslint-disable-next-line no-useless-assignment
  let { estComplete = $bindable() }: Props = $props();

  $effect(() => {
    estComplete = $brouillonEstCompletStore;
  });

  const metsAJour = async (miseAJour: MiseAJour) => {
    await metsAJourSimulation($leBrouillon.id!, miseAJour);
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
      onChampModifie={metsAJour}
    />
  </div>
{/if}

<style lang="scss">
  .conteneur-bouton-modifier {
    margin-left: auto;
  }
</style>
