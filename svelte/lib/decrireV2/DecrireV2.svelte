<script lang="ts">
  import ResumeDuServiceLectureSeule from '../creationV2/etapes/resume/ResumeDuServiceLectureSeule.svelte';
  import { convertisDonneesDescriptionEnLibelles } from '../creationV2/etapes/resume/resume.store';
  import type { DescriptionServiceV2API } from './decrireV2.d';
  import BarreActions from './BarreActions.svelte';
  import BrouillonDeServiceEditable from '../creationV2/etapes/BrouillonDeServiceEditable.svelte';
  import type { DescriptionServiceV2 } from '../creationV2/creationV2.types';
  import { rechercheOrganisation } from '../ui/rechercheOrganisation';
  import {
    metsAJourDescriptionService,
    niveauSecuriteMinimalRequis,
  } from './decrireV2.api';
  import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';
  import { toasterStore } from '../ui/stores/toaster.store';
  import type { UUID } from '../typesBasiquesSvelte';
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite';
  import ResumeNiveauSecurite from '../ui/ResumeNiveauSecurite.svelte';

  type ModeAffichage = 'Résumé' | 'Édition';

  function enEditable(
    description: DescriptionServiceV2API
  ): DescriptionServiceV2 {
    return {
      ...description,
      siret: description.organisationResponsable.siret,
      pointsAcces: description.pointsAcces.map((p) => p.description),
    };
  }

  export let descriptionService: DescriptionServiceV2API;
  export let idService: UUID;
  export let lectureSeule: boolean;

  let mode: ModeAffichage = 'Résumé';
  let ongletActif: 'informations' | 'besoinsSecurite' = 'informations';

  const copiePourRestauration = structuredClone(descriptionService);
  let descriptionEditable: DescriptionServiceV2 =
    enEditable(descriptionService);

  $: descriptionAffichable =
    convertisDonneesDescriptionEnLibelles(descriptionEditable);
</script>

<div class="conteneur-decrire-v2">
  <div class="conteneur-onglets">
    <button
      on:click={() => (ongletActif = 'informations')}
      class:actif={ongletActif === 'informations'}
    >
      Informations sur le service
    </button>
    <button
      on:click={() => (ongletActif = 'besoinsSecurite')}
      class:actif={ongletActif === 'besoinsSecurite'}
    >
      Besoins de sécurité
    </button>
  </div>
  {#if ongletActif === 'informations'}
    <div class="conteneur-resume">
      {#if mode === 'Résumé'}
        <ResumeDuServiceLectureSeule donnees={descriptionAffichable} />
      {:else}
        <BrouillonDeServiceEditable
          bind:donnees={descriptionEditable}
          seulementNomServiceEditable={false}
          on:champModifie={(e) => {
            descriptionEditable = { ...descriptionEditable, ...e.detail };
          }}
        />
      {/if}
    </div>
  {:else}
    {@const niveau = descriptionService.niveauSecurite}
    {@const donneesNiveau = donneesNiveauxDeSecurite.find(
      (d) => d.id === niveau
    )}
    <div class="conteneur-besoins-securite">
      <h5>{donneesNiveau.nom}</h5>
      <ResumeNiveauSecurite {niveau} />
    </div>
  {/if}

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
      on:enregistrer={async () => {
        const niveauMinimal =
          await niveauSecuriteMinimalRequis(descriptionEditable);
        const niveauActuelToujoursSuffisant =
          questionsV2.niveauSecurite[niveauMinimal].position <=
          questionsV2.niveauSecurite[copiePourRestauration.niveauSecurite]
            .position;
        if (niveauActuelToujoursSuffisant) {
          await metsAJourDescriptionService(idService, descriptionEditable);
          toasterStore.succes(
            'Succès',
            'Les informations du service ont été mises à jour.'
          );
          mode = 'Résumé';
        } else {
          //TODO mode = 'MiseAJourNiveauSecurite';
        }
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

  .conteneur-onglets {
    display: flex;
    flex-direction: row;
    max-width: 1000px;
    margin: 24px auto 0;
    border-bottom: 2px solid #ddd;

    button {
      background: none;
      border: none;
      font-size: 0.875rem;
      line-height: 1.5rem;
      cursor: pointer;
      padding: 12px 12px 10px 12px;
      transform: translateY(2px);
      border-bottom: 2px solid transparent;

      &.actif {
        color: #000091;
        border-bottom: 2px solid #000091;
      }
    }
  }

  .conteneur-resume,
  .conteneur-besoins-securite {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 24px;

    max-width: 1000px;
    padding: 0 54px;
    margin: 24px auto;
  }

  .conteneur-besoins-securite {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 24px;
    box-sizing: border-box;

    :global(hr) {
      display: none;
    }
  }

  h5 {
    grid-area: titre;
    padding: 0;
    align-self: baseline;
    font-weight: 700;
    font-size: 1.375rem;
    line-height: 1.75rem;
    margin: 0 8px 0 0;
  }
</style>
