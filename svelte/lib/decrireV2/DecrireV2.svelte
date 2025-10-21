<script lang="ts">
  import ResumeDuServiceLectureSeule from '../creationV2/etapes/resume/ResumeDuServiceLectureSeule.svelte';
  import { convertisDonneesDescriptionEnLibelles } from '../creationV2/etapes/resume/resume.store';
  import type { DescriptionServiceV2API } from './decrireV2.d';
  import BarreActions from './BarreActions.svelte';
  import BrouillonDeServiceEditable from '../creationV2/etapes/BrouillonDeServiceEditable.svelte';
  import type { DescriptionServiceV2 } from '../creationV2/creationV2.types';
  import {
    metsAJourDescriptionService,
    niveauSecuriteMinimalRequis,
  } from './decrireV2.api';
  import { questionsV2 } from '../../../donneesReferentielMesuresV2.js';
  import { toasterStore } from '../ui/stores/toaster.store';
  import type { UUID } from '../typesBasiquesSvelte';
  import donneesNiveauxDeSecurite from '../niveauxDeSecurite/donneesNiveauxDeSecurite';
  import ResumeNiveauSecurite from '../ui/ResumeNiveauSecurite.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import type { IdNiveauDeSecurite } from '../ui/types';
  import NiveauDeSecuriteEditable from '../creationV2/NiveauDeSecuriteEditable.svelte';
  import Toast from '../ui/Toast.svelte';

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
  let niveauDeSecuriteMinimal: IdNiveauDeSecurite;
  let majForceeBesoinsSecurite: boolean = false;

  const copiePourRestauration = structuredClone(descriptionService);
  let descriptionEditable: DescriptionServiceV2 =
    enEditable(descriptionService);

  $: descriptionAffichable =
    convertisDonneesDescriptionEnLibelles(descriptionEditable);

  const rafraichisNiveauSecuriteMinimal = async (d: DescriptionServiceV2) => {
    niveauDeSecuriteMinimal = await niveauSecuriteMinimalRequis(d);
  };

  const nomNiveauDeSecurite = (niveau: IdNiveauDeSecurite) =>
    donneesNiveauxDeSecurite.find((d) => d.id === niveau)?.nom;

  $: rafraichisNiveauSecuriteMinimal(descriptionEditable);
</script>

<Toaster />
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
  {:else if mode === 'Résumé'}
    {@const niveau = descriptionEditable.niveauSecurite}
    <div class="conteneur-besoins-securite">
      <h5>{nomNiveauDeSecurite(niveau)}</h5>
      <ResumeNiveauSecurite {niveau} />
    </div>
  {:else}
    <div class="conteneur-resume">
      <NiveauDeSecuriteEditable
        bind:niveauSelectionne={descriptionEditable.niveauSecurite}
        {niveauDeSecuriteMinimal}
        on:champModifie={async (e) => {
          descriptionEditable.niveauSecurite = e.detail.niveauSecurite;
        }}
      >
        <svelte:fragment slot="infoMajNecessaire">
          {#if majForceeBesoinsSecurite}
            <div class="conteneur-info-maj-necessaire">
              <Toast
                niveau="alerte"
                avecAnimation={false}
                avecOmbre={false}
                titre="Mise à jour des besoins en sécurité"
                contenu="Les modifications apportées aux caractéristiques du service entraînent une évolution du niveau de sécurité requis. Votre service passera ainsi des besoins <b>{nomNiveauDeSecurite(
                  copiePourRestauration.niveauSecurite
                )}</b> aux besoins <b>{nomNiveauDeSecurite(
                  niveauDeSecuriteMinimal
                )}</b>. Pour valider ces changements, veuillez confirmer ce nouveau niveau de sécurité."
              />
            </div>
          {/if}
        </svelte:fragment>
      </NiveauDeSecuriteEditable>
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
      mode={majForceeBesoinsSecurite
        ? 'MiseÀJourForcéeBesoinsSécurité'
        : 'Édition'}
      afficheInfoBesoinsSecurite={mode === 'Édition' &&
        ongletActif === 'informations' &&
        !majForceeBesoinsSecurite}
      on:enregistrer={async () => {
        const niveauActuelToujoursSuffisant =
          questionsV2.niveauSecurite[niveauDeSecuriteMinimal].position <=
          questionsV2.niveauSecurite[descriptionEditable.niveauSecurite]
            .position;
        if (niveauActuelToujoursSuffisant) {
          await metsAJourDescriptionService(idService, descriptionEditable);
          mode = 'Résumé';
          let messageSucces =
            'Les informations de votre service ont été mises à jour avec succès.';
          if (majForceeBesoinsSecurite) {
            messageSucces = `Les informations et les besoins de sécurité de votre service ont été mis à jour avec succès. <br/> Les besoins de sécurité sont passés de <b>${nomNiveauDeSecurite(
              copiePourRestauration.niveauSecurite
            )}</b> à <b>${nomNiveauDeSecurite(
              descriptionEditable.niveauSecurite
            )}.</b>`;
          }
          toasterStore.succes('Mise à jour réussie', messageSucces);
        } else {
          ongletActif = 'besoinsSecurite';
          majForceeBesoinsSecurite = true;
          descriptionEditable.niveauSecurite = niveauDeSecuriteMinimal;
        }
      }}
      on:annuler={() => {
        descriptionEditable = enEditable(copiePourRestauration);
        window.scrollTo(0, 0);
        mode = 'Résumé';
        majForceeBesoinsSecurite = false;
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

    :global(hr) {
      display: none;
    }
  }

  .conteneur-besoins-securite {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 24px;
    box-sizing: border-box;
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

  .conteneur-info-maj-necessaire {
    margin-bottom: 24px;
  }
</style>
