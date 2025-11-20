<script lang="ts">
  import { type MiseAJour } from './creationV2.api';
  import { createEventDispatcher } from 'svelte';
  import JaugeDeProgression from './JaugeDeProgression.svelte';
  import { navigationStore } from './etapes/navigation.store';
  import { etapeCourante } from './etapes/etapeCourante.store';
  import { leBrouillon } from './etapes/brouillon.store';
  import Switch from '../ui/Switch.svelte';
  import Toaster from '../ui/Toaster.svelte';

  export let enCoursDeChargement;
  export let titreAssistant: string;
  let questionCouranteEstComplete = false;
  let modeRapide = false;

  const emetEvenement = createEventDispatcher<{
    champModifie: MiseAJour;
    finalise: void;
  }>();

  const metsAJourPropriete = async (e: CustomEvent<MiseAJour>) => {
    if (!questionCouranteEstComplete) return;

    emetEvenement('champModifie', e.detail);
  };

  const suivant = () => {
    navigationStore.suivant();
    document
      .querySelector('dsfr-stepper')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const finalise = async () => {
    emetEvenement('finalise');
  };
</script>

<Toaster />
<div class="conteneur-creation">
  <div class="formulaire-creation">
    <div
      class="contenu-formulaire"
      class:sans-explications={$etapeCourante.pleinePage}
    >
      {#if $etapeCourante.estPremiereQuestion && !$navigationStore.modeRapide}
        <div class="conteneur-titre-premiere-question">
          <h2>{titreAssistant}</h2>
          <span
            >Complétez les informations permettant d'évaluer les besoins de
            sécurité du service et de proposer des mesures de sécurité adaptées.</span
          >
        </div>
      {/if}
      <dsfr-stepper
        title={$etapeCourante.titre}
        nextStep={$etapeCourante.titreEtapeSuivante}
        currentStep={$etapeCourante.numero}
        stepCount={$etapeCourante.numeroMax}
      />
      {#if $etapeCourante.nombreQuestions > 1}
        <hr />
        {#if $etapeCourante.estPremiereQuestion && !$navigationStore.modeRapide}
          <span class="mention-obligatoire"
            >Les champs suivis d’un astérisque (*) sont obligatoires.</span
          >
        {/if}
        <JaugeDeProgression />
      {/if}
      <svelte:component
        this={$etapeCourante.questionCourante.composant}
        bind:estComplete={questionCouranteEstComplete}
        on:champModifie={metsAJourPropriete}
      />
    </div>
    <div
      class="barre-boutons"
      class:sans-explications={$etapeCourante.pleinePage}
    >
      <div>
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
          titre={$etapeCourante.estDerniereQuestion
            ? 'Commencer à sécuriser le service'
            : 'Suivant'}
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
        <div class="info-enregistrement-automatique">
          <span>Votre brouillon est enregistré automatiquement.</span>
        </div>
      </div>
    </div>
  </div>
  {#if $etapeCourante.illustration}
    <aside>
      <div class="contenu-informatif">
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
      </div>
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

  .conteneur-titre-premiere-question {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 8px;

    h2 {
      margin: 0;
      font-size: 2rem;
      line-height: 2.5rem;
      font-weight: bold;
      color: #161616;
    }

    span {
      font-size: 1.25rem;
      line-height: 2rem;
      color: #3a3a3a;
    }
  }

  dsfr-stepper {
    max-width: 590px;
    scroll-margin-top: 16px;
  }

  .mention-obligatoire {
    font-size: 1.125rem;
    line-height: 1.75rem;
    color: #3a3a3a;
    margin-bottom: 8px;
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
    margin-left: 4px;
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
        height: calc(100% - 44px - 91px - 24px);

        &.sans-explications {
          max-width: 924px;
        }

        hr {
          margin: -24px 0 8px 0;
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
      }

      .barre-boutons {
        position: sticky;
        bottom: 0;
        background: white;
        padding: 24px;
        border-top: 1px solid #ddd;
        margin-top: 24px;

        & > div {
          display: flex;
          gap: 12px;
          align-items: center;
          max-width: 684px;
          margin: auto;
        }

        &.sans-explications > div {
          max-width: 924px;
        }
      }
    }

    aside {
      max-width: 448px;
      padding: 32px 24px;
      background: #f4f6fe;
      position: relative;

      .contenu-informatif {
        position: sticky;
        top: 32px;
      }

      img {
        max-width: 100%;
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
