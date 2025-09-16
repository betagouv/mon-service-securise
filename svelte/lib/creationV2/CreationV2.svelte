<script lang="ts">
  import {
    enCoursDeChargement,
    etapeCourante,
    etapeStore,
  } from './etapes/etapes.store';
  import {
    lisBrouillonService,
    metsAJourBrouillonService,
    unBrouillonVierge,
  } from './creationV2.api';
  import { onMount } from 'svelte';
  import type { UUID } from '../typesBasiquesSvelte';
  import type { Brouillon } from './creationV2.d';
  import JaugeDeProgression from './JaugeDeProgression.svelte';

  let donneesBrouillon: Brouillon = unBrouillonVierge();
  let questionCouranteEstComplete = false;

  onMount(async () => {
    const requete = new URLSearchParams(window.location.search);
    if (requete.has('id')) {
      const id = requete.get('id') as UUID;
      donneesBrouillon = await lisBrouillonService(id);
      etapeStore.rechargeBrouillon(id, donneesBrouillon);
    }
  });

  const metsAJourPropriete = async (e: CustomEvent<string>) => {
    if (!questionCouranteEstComplete) return;
    const idBrouillon = $etapeStore.idBrouillonExistant;
    if (!idBrouillon) return;

    const valeur = e.detail;
    const cle = $etapeCourante.questionCourante.clePropriete;

    await metsAJourBrouillonService(idBrouillon, cle, valeur);
  };

  const suivant = async () => {
    const cle = $etapeCourante.questionCourante.clePropriete;
    await etapeStore.suivant(donneesBrouillon[cle]!);
  };

  const finalise = async () => {
    await etapeStore.finalise();
  };
</script>

<div class="conteneur-creation">
  <div class="formulaire-creation">
    <div class="contenu-formulaire">
      <div class="etapier">
        <span>Étape {$etapeCourante.numero} sur {$etapeCourante.numeroMax}</span
        >
        <h2>{$etapeCourante.titre}</h2>
        {#if $etapeCourante.titreEtapeSuivante}
          <span class="suivante"
            ><b>Étape suivante :</b> {$etapeCourante.titreEtapeSuivante}</span
          >
        {/if}
      </div>
      <hr />
      <JaugeDeProgression />
      <svelte:component
        this={$etapeCourante.questionCourante.composant}
        bind:estComplete={questionCouranteEstComplete}
        bind:valeur={donneesBrouillon[
          $etapeCourante.questionCourante.clePropriete
        ]}
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
            on:click={etapeStore.precedent}
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
          actif={questionCouranteEstComplete && !$enCoursDeChargement}
          on:click={async () =>
            $etapeCourante.estDerniereQuestion
              ? await finalise()
              : await suivant()}
        />
      </div>
    </div>
  </div>
  <aside>
    <img alt="" src={$etapeCourante.illustration} />
    <h3>Pourquoi demander ces informations ?</h3>
    {#each $etapeCourante.questionCourante.explications as explication}
      <p>{explication}</p>
    {/each}
  </aside>
</div>

<style lang="scss">
  :global(#creation-v2) {
    background: white;
    width: 100%;
    height: 100%;
    text-align: left;
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

        .etapier {
          h2 {
            margin: 4px 0 0;
            font-size: 1.25rem;
            line-height: 1.75rem;
          }
          .suivante {
            font-size: 0.75rem;
            line-height: 1.25rem;
            color: #666;
          }
        }

        hr {
          width: 100%;
          color: #ddd;
          background: #ddd;
          border-color: transparent;
          border-bottom: none;
          margin: 8px 0;
        }

        :global(label) {
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: bold;
        }

        .barre-boutons {
          display: flex;
          gap: 16px;
          margin-top: 8px;
        }
      }
    }

    aside {
      max-width: 448px;
      padding: 32px 24px;
      background: #f4f6fe;

      img {
        width: 100%;
        max-width: 400px;
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
