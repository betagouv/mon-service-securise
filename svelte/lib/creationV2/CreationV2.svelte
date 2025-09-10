<script lang="ts">
  import {
    etapeCourante,
    etapeStore,
    toutesClesPropriete,
  } from './etapes/etapes.store';
  import { metsAJourBrouillonService } from './creationV2.api';

  let donneesService: { [key: string]: string | number } = Object.fromEntries(
    toutesClesPropriete.map((cle) => [cle, ''])
  );
  let questionCouranteEstComplete = false;

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
    await etapeStore.suivant(donneesService[cle]);
  };

  const finalise = async () => {
    await etapeStore.finalise();
  };
</script>

<div class="conteneur-creation">
  <div class="formulaire-creation">
    <div class="contenu-formulaire">
      <span>Étape {$etapeCourante.numero} sur {$etapeCourante.numeroMax}</span>
      <h2>{$etapeCourante.titre}</h2>
      {#if $etapeCourante.titreEtapeSuivante}
        <span><b>Étape suivante :</b> {$etapeCourante.titreEtapeSuivante}</span>
      {/if}
      <hr />
      <span
        ><b
          >Question {$etapeCourante.numeroQuestionCourante} sur {$etapeCourante.nombreQuestions}</b
        ></span
      >
      <svelte:component
        this={$etapeCourante.questionCourante.composant}
        bind:estComplete={questionCouranteEstComplete}
        bind:valeur={donneesService[
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
          actif={questionCouranteEstComplete}
          on:click={async () =>
            $etapeCourante.estDerniereQuestion
              ? await finalise()
              : await suivant()}
        />
      </div>
    </div>
  </div>
  <aside>
    <img
      alt=""
      src="/statique/assets/images/illustration_accueil_connexion.svg"
    />
    <p>Pourquoi demander ces informations ?</p>
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

        hr {
          width: 100%;
        }

        :global(label) {
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: bold;
        }

        .barre-boutons {
          display: flex;
          gap: 12px;
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
    }
  }
</style>
