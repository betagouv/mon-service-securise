<script lang="ts">
  import {
    creeBrouillonService,
    finaliseBrouillonService,
    lisBrouillonService,
    metsAJourBrouillonService,
    type MiseAJour,
  } from './creationV2.api';
  import { onMount } from 'svelte';
  import type { UUID } from '../typesBasiquesSvelte';
  import JaugeDeProgression from './JaugeDeProgression.svelte';
  import { navigationStore } from './etapes/navigation.store';
  import { etapeCourante } from './etapes/etapeCourante.store';
  import { leBrouillon } from './etapes/brouillon.store';
  import { ajouteParametreAUrl } from '../outils/url';
  import type { BrouillonSvelte } from './creationV2.types';
  import Switch from '../ui/Switch.svelte';

  let questionCouranteEstComplete = false;
  let enCoursDeChargement = false;
  let modeRapide = false;

  onMount(async () => {
    const requete = new URLSearchParams(window.location.search);
    if (requete.has('id')) {
      const idBrouillon = requete.get('id') as UUID;
      const donneesBrouillon = await lisBrouillonService(idBrouillon);
      leBrouillon.chargeDonnees(donneesBrouillon);
      navigationStore.reprendreEditionDe($leBrouillon, modeRapide);
    } else {
      navigationStore.changeModeEdition(modeRapide);
    }
  });

  const metsAJourPropriete = async (e: CustomEvent<MiseAJour>) => {
    if (!questionCouranteEstComplete) return;

    const doitCreerBrouillon =
      !$leBrouillon.id && $etapeCourante.estPremiereQuestion;
    if (doitCreerBrouillon) {
      const nomService = e.detail.nomService as string;
      const idBrouillon = await creeBrouillonService(nomService);
      ajouteParametreAUrl('id', idBrouillon);
      leBrouillon.chargeDonnees({ id: idBrouillon, nomService });
      return;
    }

    await metsAJourBrouillonService($leBrouillon.id!, e.detail);

    const nomChampModifie = Object.keys(e.detail)[0] as keyof BrouillonSvelte;
    const onEstToujoursSurLaQuestionQuiAEnvoyeLaMaj =
      $etapeCourante.questionCourante.clesPropriete.includes(nomChampModifie);
    // si on n'est plus sur la question mise à jour, c'est que "suivant()" a déjà été appelé
    if (
      onEstToujoursSurLaQuestionQuiAEnvoyeLaMaj &&
      $etapeCourante.questionCourante.avecAvanceRapide
    )
      navigationStore.suivant();
  };

  const suivant = () => navigationStore.suivant();

  const finalise = async () => {
    enCoursDeChargement = true;
    await finaliseBrouillonService($leBrouillon.id!);
    enCoursDeChargement = false;
    window.location.href = '/tableauDeBord';
  };
</script>

<div class="conteneur-creation">
  <div class="formulaire-creation">
    <div
      class="contenu-formulaire"
      class:sans-explications={!$navigationStore.modeRapide &&
        $etapeCourante.questionCourante.explications.length === 0}
    >
      <dsfr-stepper
        title={$etapeCourante.titre}
        nextStep={$etapeCourante.titreEtapeSuivante}
        currentStep={$etapeCourante.numero}
        stepCount={$etapeCourante.numeroMax}
      />
      {#if $etapeCourante.nombreQuestions > 1}
        <hr />
        <JaugeDeProgression />
      {/if}
      <svelte:component
        this={$etapeCourante.questionCourante.composant}
        bind:estComplete={questionCouranteEstComplete}
        on:champModifie={metsAJourPropriete}
      />

      <div class="barre-boutons">
        {#if $etapeCourante.estPremiereQuestion}
          <lab-anssi-lien
            titre="Retour au tableau de bord"
            apparence="bouton"
            variante="tertiaire"
            taille="md"
            positionIcone="sans"
            href="/tableauDeBord"
          />
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
          <lab-anssi-bouton
            titre="Précédent"
            variante="tertiaire-sans-bordure"
            taille="md"
            icone="arrow-left-line"
            positionIcone="gauche"
            on:click={navigationStore.precedent}
          />
        {/if}

        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <lab-anssi-bouton
          titre={$etapeCourante.estDerniereQuestion ? 'Finaliser' : 'Suivant'}
          variante="primaire"
          taille="md"
          icone={$etapeCourante.estDerniereQuestion
            ? 'check-line'
            : 'arrow-right-line'}
          positionIcone="droite"
          actif={questionCouranteEstComplete && !enCoursDeChargement}
          on:click={async () =>
            $etapeCourante.estDerniereQuestion ? await finalise() : suivant()}
        />
      </div>

      <div class="info-enregistrement-automatique">
        Votre brouillon est enregistré automatiquement.
      </div>
    </div>
  </div>
  {#if $etapeCourante.illustration}
    <aside>
      <div class="selection-mode-rapide">
        <Switch
          id="modeRapide"
          bind:actif={modeRapide}
          labelActif="⚡ Mode rapide"
          labelInactif="⚡ Mode rapide"
          on:change={() => {
            navigationStore.reprendreEditionDe($leBrouillon, modeRapide);
          }}
        />
        <div class="explications-mode-rapide">
          Accélérez votre saisie avec un formulaire plus direct, sans contenu
          pédagogique.
        </div>
        <hr />
      </div>
      <img alt="" src={$etapeCourante.illustration} />
      {#if !modeRapide}
        <h3>Pourquoi demander ces informations ?</h3>
        {#each $etapeCourante.questionCourante.explications as explication}
          <p>{explication}</p>
        {/each}
      {/if}
    </aside>
  {/if}
</div>

<style lang="scss">
  hr {
    width: 100%;
    color: #ddd;
    background: #ddd;
    border-color: transparent;
    border-bottom: none;
    padding: 0;
    margin: 0;
  }

  :global(#creation-v2) {
    background: white;
    width: 100%;
    height: 100%;
    text-align: left;
  }

  .selection-mode-rapide {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 16px 0 24px;
  }

  .info-enregistrement-automatique {
    font-size: 0.75rem;
    line-height: 1.25rem;
    color: #666;
    margin-bottom: 32px;
  }

  .conteneur-creation {
    display: flex;
    height: 100%;

    .formulaire-creation {
      flex: 1;

      .contenu-formulaire {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 684px;
        margin: auto;
        padding-top: 44px;

        &.sans-explications {
          max-width: 924px;
        }

        hr {
          margin: -24px 0 40px 0;
        }

        :global(.titre-question) {
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: bold;
          max-width: 586px;
        }

        .barre-boutons {
          display: flex;
          gap: 16px;
          margin-top: 8px;
          margin-bottom: 16px;
        }
      }
    }

    aside {
      max-width: 448px;
      padding: 32px 24px;
      background: #f4f6fe;

      img {
        width: 100%;
        max-width: 350px;
        display: flex;
        margin: auto;
      }

      h3 {
        font-size: 1.125rem;
        line-height: 1.75rem;
        font-weight: bold;
        margin: 24px 0 8px;
        color: #0d0c21;
      }

      p {
        font-size: 1rem;
        line-height: 1.5rem;
        color: #161616;
      }
    }
  }
</style>
