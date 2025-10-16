<script lang="ts">
  import ResumeDuServiceLectureSeule from '../creationV2/etapes/resume/ResumeDuServiceLectureSeule.svelte';
  import { convertisDonneesDescriptionEnLibelles } from '../creationV2/etapes/resume/resume.store';
  import type { DescriptionServiceV2API } from './decrireV2.d';
  import BarreActions from './BarreActions.svelte';

  type ModeAffichage = 'Resume' | 'Édition';

  export let descriptionService: DescriptionServiceV2API;
  export let lectureSeule: boolean;

  let mode: ModeAffichage = 'Resume';
</script>

<div class="conteneur-decrire-v2">
  <div class="conteneur-resume">
    {#if mode === 'Resume'}
      <ResumeDuServiceLectureSeule
        entite={descriptionService.organisationResponsable}
        donnees={convertisDonneesDescriptionEnLibelles({
          ...descriptionService,
          pointsAcces: descriptionService.pointsAcces.map((p) => p.description),
        })}
      />
    {:else}
      <p>Formulaire éditable</p>
    {/if}
  </div>

  {#if !lectureSeule && mode === 'Resume'}
    <BarreActions on:modifier={() => (mode = 'Édition')} />
  {/if}
</div>

<style lang="scss">
  /* Annule la couleur `fond-pale` positionnée par le pug */
  :global(.zone-principale) {
    background: unset;
  }

  /* On refait passer le conteneur en "plein écran" pour pouvoir mettre une barre d'action sticky qui s'étend */
  :global(.conteneur-page-formulaire) {
    padding: 0;
    margin: 0;
    max-width: unset;
  }

  .conteneur-resume {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 24px;

    max-width: 1000px;
    padding: 0 54px;
    margin: 24px auto;
  }
</style>
