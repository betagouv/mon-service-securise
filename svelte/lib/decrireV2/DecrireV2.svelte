<script lang="ts">
  import ResumeDuServiceLectureSeule from '../creationV2/etapes/resume/ResumeDuServiceLectureSeule.svelte';
  import { convertisDonneesDescriptionEnLibelles } from '../creationV2/etapes/resume/resume.store';
  import type { DescriptionServiceV2API } from './decrireV2.d';

  export let descriptionService: DescriptionServiceV2API;
  export let lectureSeule: boolean;
  let modeRecapitulatif: boolean = true;
</script>

<div class="conteneur-decrire-v2">
  {#if modeRecapitulatif}
    {#if !lectureSeule}
      <div class="conteneur-bouton-modifier">
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <lab-anssi-bouton
          titre="Modifier le service"
          variante="tertiaire"
          taille="md"
          icone="edit-line"
          positionIcone="droite"
          on:click={() => (modeRecapitulatif = false)}
        />
      </div>
    {/if}
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

<style lang="scss">
  .conteneur-decrire-v2 {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 24px;

    .conteneur-bouton-modifier {
      margin-left: auto;
    }
  }
</style>
