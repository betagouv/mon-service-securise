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
  import ResumeNiveauSecurite from '../ui/ResumeNiveauSecurite.svelte';
  import Toaster from '../ui/Toaster.svelte';
  import type { IdNiveauDeSecurite } from '../ui/types';
  import NiveauDeSecuriteEditable from '../creationV2/NiveauDeSecuriteEditable.svelte';
  import Toast from '../ui/Toast.svelte';
  import OngletsDecrireV2 from './OngletsDecrireV2.svelte';
  import {
    avertissementChangementObligatoire,
    miseAJourForceeReussie,
    nomNiveauDeSecurite,
  } from './niveauDeSecurite.messages';
  import { onMount } from 'svelte';
  import type { DonneesDescriptionServiceV2 } from '../../../src/modeles/descriptionServiceV2';
  import type { MiseAJour } from '../creationV2/creationV2.api';

  const ChampsImpactantsLeNiveauDeSecurite: (keyof DonneesDescriptionServiceV2)[] =
    [
      'volumetrieDonneesTraitees',
      'categoriesDonneesTraitees',
      'categoriesDonneesTraiteesSupplementaires',
      'dureeDysfonctionnementAcceptable',
      'audienceCible',
      'ouvertureSysteme',
    ];

  type ModeAffichage = 'Résumé' | 'Édition';

  const enEditable = (
    description: DescriptionServiceV2API
  ): DescriptionServiceV2 => ({
    ...description,
    siret: description.organisationResponsable.siret,
    pointsAcces: description.pointsAcces.map((p) => p.description),
  });

  const retourAuModeResume = () => {
    mode = 'Résumé';
    majForceeBesoinsSecurite = false;
    window.scrollTo(0, 0);
  };

  export let descriptionService: DescriptionServiceV2API;
  export let idService: UUID;
  export let lectureSeule: boolean;

  let mode: ModeAffichage = 'Résumé';
  let ongletActif: 'informations' | 'besoinsSecurite' = 'informations';
  let niveauDeSecuriteMinimal: IdNiveauDeSecurite;
  let majForceeBesoinsSecurite: boolean = false;

  let copiePourRestauration: DescriptionServiceV2 = structuredClone(
    enEditable(descriptionService)
  );
  let descriptionEditable: DescriptionServiceV2 =
    enEditable(descriptionService);

  $: descriptionAffichable =
    convertisDonneesDescriptionEnLibelles(descriptionEditable);

  const rafraichisNiveauSecuriteMinimal = async () => {
    niveauDeSecuriteMinimal =
      await niveauSecuriteMinimalRequis(descriptionEditable);
  };

  onMount(async () => {
    await rafraichisNiveauSecuriteMinimal();
  });

  const metsAJourDescriptionEditable = async (e: CustomEvent<MiseAJour>) => {
    descriptionEditable = { ...descriptionEditable, ...e.detail };

    const recalculEstNecessaire = Object.keys(e.detail).some((cle) =>
      ChampsImpactantsLeNiveauDeSecurite.includes(
        cle as keyof DonneesDescriptionServiceV2
      )
    );
    if (recalculEstNecessaire) await rafraichisNiveauSecuriteMinimal();
  };
</script>

<Toaster />
<div class="conteneur-decrire-v2">
  <OngletsDecrireV2 bind:ongletActif />
  {#if ongletActif === 'informations'}
    <div class="conteneur-resume">
      {#if mode === 'Résumé'}
        <ResumeDuServiceLectureSeule donnees={descriptionAffichable} />
      {:else}
        <BrouillonDeServiceEditable
          bind:donnees={descriptionEditable}
          seulementNomServiceEditable={false}
          on:champModifie={metsAJourDescriptionEditable}
        />
      {/if}
    </div>
  {:else if mode === 'Résumé'}
    {@const niveau = descriptionEditable.niveauSecurite}
    <div class="conteneur-besoins-securite">
      <div class="conteneur-titre">
        <h5>{nomNiveauDeSecurite(niveau)}</h5>
        {#if niveau === niveauDeSecuriteMinimal}
          <dsfr-tag
            label="Besoins identifiés par l'ANSSI"
            size="md"
            hasIcon
            icon="star-s-fill"
          />
        {/if}
      </div>
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
                contenu={avertissementChangementObligatoire(
                  copiePourRestauration.niveauSecurite,
                  niveauDeSecuriteMinimal
                )}
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
        const niveauActuelInsuffisant =
          questionsV2.niveauSecurite[descriptionEditable.niveauSecurite]
            .position <
          questionsV2.niveauSecurite[niveauDeSecuriteMinimal].position;

        if (niveauActuelInsuffisant) {
          ongletActif = 'besoinsSecurite';
          majForceeBesoinsSecurite = true;
          descriptionEditable.niveauSecurite = niveauDeSecuriteMinimal;
          return;
        }

        await metsAJourDescriptionService(idService, descriptionEditable);
        const messageSucces = majForceeBesoinsSecurite
          ? miseAJourForceeReussie(
              copiePourRestauration.niveauSecurite,
              descriptionEditable.niveauSecurite
            )
          : 'Les informations de votre service ont été mises à jour avec succès.';
        toasterStore.succes('Mise à jour réussie', messageSucces);

        copiePourRestauration = structuredClone(descriptionEditable);
        retourAuModeResume();
      }}
      on:annuler={() => {
        descriptionEditable = structuredClone(copiePourRestauration);
        retourAuModeResume();
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

  :global(.conteneur-avec-cadre) {
    max-width: 950px !important;
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

    .conteneur-titre {
      display: flex;
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

  .conteneur-info-maj-necessaire {
    margin-bottom: 24px;
  }
</style>
