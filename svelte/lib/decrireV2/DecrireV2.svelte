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
  import {
    type NiveauSecurite,
    questionsV2,
  } from '../../../donneesReferentielMesuresV2.js';
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
  import { onMount, untrack } from 'svelte';
  import type { MiseAJour } from '../creationV2/creationV2.api';
  import { donneesDeServiceSontCompletes } from '../creationV2/etapes/brouillonEstComplet.store';
  import type { AxiosError } from 'axios';

  const ChampsImpactantsLeNiveauDeSecurite: string[] = [
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

  interface Props {
    descriptionService: DescriptionServiceV2API;
    idService: UUID;
    lectureSeule: boolean;
    doitFinaliserDescription: boolean;
  }

  let {
    descriptionService,
    idService,
    lectureSeule,
    doitFinaliserDescription,
  }: Props = $props();

  let mode: ModeAffichage = $state('Résumé');
  let ongletActif: 'informations' | 'besoinsSecurite' = $state('informations');
  let niveauDeSecuriteMinimal: IdNiveauDeSecurite | undefined = $state();
  let majForceeBesoinsSecurite: boolean = $state(false);

  let copiePourRestauration: DescriptionServiceV2 = $state(
    untrack(() => enEditable(descriptionService))
  );
  let descriptionEditable: DescriptionServiceV2 = $state(
    untrack(() => enEditable(descriptionService))
  );

  let descriptionAffichable = $derived(
    convertisDonneesDescriptionEnLibelles(descriptionEditable)
  );
  let descriptionEstComplete = $derived(
    donneesDeServiceSontCompletes(descriptionEditable)
  );

  const rafraichisNiveauSecuriteMinimal = async () => {
    niveauDeSecuriteMinimal =
      await niveauSecuriteMinimalRequis(descriptionEditable);
  };

  onMount(async () => {
    await rafraichisNiveauSecuriteMinimal();
  });

  const metsAJourDescriptionEditable = async (miseAJour: MiseAJour) => {
    descriptionEditable = { ...descriptionEditable, ...miseAJour };

    const recalculEstNecessaire = Object.keys(miseAJour).some((cle) =>
      ChampsImpactantsLeNiveauDeSecurite.includes(cle)
    );
    if (recalculEstNecessaire) await rafraichisNiveauSecuriteMinimal();
  };

  const enregistreDescriptionService = async () => {
    if (!niveauDeSecuriteMinimal || descriptionEditable.niveauSecurite === '')
      return;

    const niveauActuelInsuffisant =
      questionsV2.niveauSecurite[descriptionEditable.niveauSecurite].position <
      questionsV2.niveauSecurite[niveauDeSecuriteMinimal].position;

    if (niveauActuelInsuffisant) {
      ongletActif = 'besoinsSecurite';
      majForceeBesoinsSecurite = true;
      descriptionEditable.niveauSecurite = niveauDeSecuriteMinimal;
      return;
    }

    try {
      await metsAJourDescriptionService(idService, descriptionEditable);

      const messageSucces = majForceeBesoinsSecurite
        ? miseAJourForceeReussie(
            copiePourRestauration.niveauSecurite as NiveauSecurite,
            descriptionEditable.niveauSecurite
          )
        : 'Les informations de votre service ont été mises à jour avec succès.';
      toasterStore.succes('Mise à jour réussie', messageSucces);

      copiePourRestauration = $state.snapshot(descriptionEditable);
      retourAuModeResume();
    } catch (e) {
      const x = e as AxiosError<{ erreur: { code: string } }>;
      if (
        x.response?.status === 422 &&
        x.response?.data?.erreur?.code === 'NOM_SERVICE_DEJA_EXISTANT'
      ) {
        const elementRacine: HTMLElement & {
          status: string;
          errorMessage: string;
        } = document.querySelector("dsfr-input[nom='nom-service']")!;
        elementRacine.status = 'error';
        elementRacine.errorMessage = 'Ce nom de service est déjà utilisé.';
        document
          .querySelector('.formulaire')
          ?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
</script>

<Toaster />
<div class="conteneur-decrire-v2">
  {#if doitFinaliserDescription}
    <div class="conteneur-alerte">
      <dsfr-alert
        has-title
        title="Complétez les informations de votre service"
        has-description
        text="Pour obtenir une évaluation de sécurité au plus proche de la réalité de votre service, renseignez l’ensemble des informations : description, fonctionnalités et données traitées."
        type="info"
        size="md"
      ></dsfr-alert>
    </div>
  {/if}
  <OngletsDecrireV2 bind:ongletActif />
  {#if ongletActif === 'informations'}
    <div class="conteneur-resume">
      {#if mode === 'Résumé'}
        <ResumeDuServiceLectureSeule donnees={descriptionAffichable} />
      {:else}
        <BrouillonDeServiceEditable
          bind:donnees={descriptionEditable}
          seulementNomServiceEditable={false}
          onChampModifie={metsAJourDescriptionEditable}
        />
      {/if}
    </div>
  {:else if mode === 'Résumé'}
    {@const niveau = descriptionEditable.niveauSecurite}
    {#if niveau}
      <div class="conteneur-besoins-securite">
        <div class="conteneur-titre">
          <h5>{nomNiveauDeSecurite(niveau)}</h5>
          {#if niveau === niveauDeSecuriteMinimal}
            <dsfr-tag
              label="Besoins identifiés par l'ANSSI"
              size="md"
              hasIcon
              icon="star-s-fill"
            ></dsfr-tag>
          {/if}
        </div>
        <ResumeNiveauSecurite {niveau} />
      </div>
    {/if}
  {:else}
    <div class="conteneur-resume">
      {#if niveauDeSecuriteMinimal}
        <NiveauDeSecuriteEditable
          bind:niveauSelectionne={descriptionEditable.niveauSecurite}
          {niveauDeSecuriteMinimal}
          onChampModifie={async (miseAJour) => {
            descriptionEditable.niveauSecurite = miseAJour.niveauSecurite;
          }}
        >
          {#snippet infoMajNecessaire()}
            {#if niveauDeSecuriteMinimal && majForceeBesoinsSecurite && copiePourRestauration.niveauSecurite}
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
                  avecInterpolationHTMLDangereuse
                />
              </div>
            {/if}
          {/snippet}
        </NiveauDeSecuriteEditable>
      {/if}
    </div>
  {/if}

  {#if !lectureSeule && mode === 'Résumé'}
    <BarreActions
      mode="Résumé"
      onModifier={() => {
        mode = 'Édition';
      }}
    />
  {/if}
  {#if mode === 'Édition'}
    <BarreActions
      activeBoutonEnregistrer={descriptionEstComplete}
      mode={majForceeBesoinsSecurite
        ? 'MiseÀJourForcéeBesoinsSécurité'
        : 'Édition'}
      afficheInfoBesoinsSecurite={mode === 'Édition' &&
        ongletActif === 'informations' &&
        !majForceeBesoinsSecurite}
      onEnregistrer={async () => enregistreDescriptionService()}
      onAnnuler={() => {
        descriptionEditable = $state.snapshot(copiePourRestauration);
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

  .conteneur-resume,
  .conteneur-besoins-securite {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin: 24px 0 32px;
  }

  .conteneur-alerte {
    margin: 0 72px;

    dsfr-alert {
      max-width: 792px;
      text-align: left;
    }
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
