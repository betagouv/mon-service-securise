<script lang="ts">
  import ResumeDuServiceLectureSeule from '../creationV2/etapes/resume/ResumeDuServiceLectureSeule.svelte';
  import { convertisDonneesDescriptionEnLibelles } from '../creationV2/etapes/resume/resume.store';
  import type { ServiceV2 } from './decrireV2.d';

  export let service: ServiceV2;
  let lectureSeule: boolean = true;
</script>

<div class="conteneur-decrire-v2">
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
    <ResumeDuServiceLectureSeule
      entite={service.descriptionService.organisationResponsable}
      donnees={convertisDonneesDescriptionEnLibelles({
        ...service.descriptionService,
        pointsAcces: service.descriptionService.pointsAcces.map(
          (p) => p.description
        ),
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
