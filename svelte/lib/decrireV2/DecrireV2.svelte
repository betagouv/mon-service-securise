<script lang="ts">
  import ResumeDuServiceLectureSeule from '../creationV2/etapes/resume/ResumeDuServiceLectureSeule.svelte';
  import { convertisDonneesDescriptionEnLibelles } from '../creationV2/etapes/resume/resume.store';
  import type { DescriptionServiceV2API } from './decrireV2.d';
  import BarreActions from './BarreActions.svelte';
  import BrouillonDeServiceEditable from '../creationV2/etapes/BrouillonDeServiceEditable.svelte';
  import type { BrouillonSvelte } from '../creationV2/creationV2.types';
  import { rechercheOrganisation } from '../ui/rechercheOrganisation';

  type ModeAffichage = 'Résumé' | 'Édition';

  function enEditable(description: DescriptionServiceV2API): BrouillonSvelte {
    return {
      ...description,
      siret: description.organisationResponsable.siret,
      pointsAcces: description.pointsAcces.map((p) => p.description),
    };
  }

  export let descriptionService: DescriptionServiceV2API;
  export let lectureSeule: boolean;

  let mode: ModeAffichage = 'Résumé';

  const copiePourRestauration = structuredClone(descriptionService);
  let descriptionEditable: BrouillonSvelte = enEditable(descriptionService);
  $: descriptionAffichable =
    convertisDonneesDescriptionEnLibelles(descriptionEditable);

  let organisationResponsable = descriptionService.organisationResponsable;
  async function rechargeOrganisationResponsabe(siret: string) {
    const entite = (await rechercheOrganisation(siret))[0];
    organisationResponsable = entite;
  }
  $: rechargeOrganisationResponsabe(descriptionEditable.siret);
</script>

<div class="conteneur-decrire-v2">
  <div class="conteneur-resume">
    {#if mode === 'Résumé'}
      <ResumeDuServiceLectureSeule
        entite={organisationResponsable}
        donnees={descriptionAffichable}
      />
    {:else}
      <BrouillonDeServiceEditable
        donnees={descriptionEditable}
        seulementNomServiceEditable={false}
        on:champModifie={(e) => {
          descriptionEditable = { ...descriptionEditable, ...e.detail };
        }}
      />
    {/if}
  </div>

  {#if !lectureSeule && mode === 'Résumé'}
    <BarreActions
      mode="Résumé"
      on:modifier={() => {
        mode = 'Édition';
      }}
    />
  {/if}
  {#if mode === 'Édition'}
    <BarreActions
      mode="Édition"
      on:enregistrer={() => {
        mode = 'Résumé';
      }}
      on:annuler={() => {
        descriptionEditable = enEditable(copiePourRestauration);
        window.scrollTo(0, 0);
        mode = 'Résumé';
      }}
    />
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
