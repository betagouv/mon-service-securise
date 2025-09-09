<script lang="ts">
  import ChampTexte from '../ui/ChampTexte.svelte';
  import {
    creeBrouillonService,
    finaliseBrouillonService,
    metsAJourBrouillonService,
  } from './creationV2.api';
  import type { UUID } from '../typesBasiquesSvelte';

  let donneesService: { nomService: string; siret: string } = {
    nomService: '',
    siret: '',
  };
  let chargementEnCours = false;
  let etapeCourante = 1;
  const ETAPE_FINALE = 2;
  $: estEtapeFinale = etapeCourante === ETAPE_FINALE;

  let idBrouillon: UUID | null = null;
  const creeBrouillon = async () => {
    chargementEnCours = true;
    idBrouillon = await creeBrouillonService(donneesService.nomService);
    etapeCourante = 2;
    chargementEnCours = false;
  };

  const finaliseBrouillon = async () => {
    if (idBrouillon === null) return;
    chargementEnCours = true;
    await finaliseBrouillonService(idBrouillon);
    window.location.href = '/tableauDeBord';
  };

  const metsAJourPropriete = async (clePropriete: string, valeur: string) => {
    if (idBrouillon === null) return;
    chargementEnCours = true;
    try {
      await metsAJourBrouillonService(idBrouillon, clePropriete, valeur);
    } finally {
      chargementEnCours = false;
    }
  };
</script>

<div class="conteneur-creation">
  <div class="formulaire-creation">
    <div class="contenu-formulaire">
      <h1>Ajouter un service</h1>

      {#if etapeCourante === 1}
        <label for="nom-service">
          Quel est le nom de votre service ?
          <ChampTexte
            id="nom-service"
            nom="nom-service"
            bind:valeur={donneesService.nomService}
          />
        </label>
      {:else}
        <label for="nom-service">
          Quel est le nom ou siret de l’organisation ?
          <ChampTexte
            id="siret"
            nom="siret"
            bind:valeur={donneesService.siret}
            on:blur={() => metsAJourPropriete('siret', donneesService.siret)}
          />
        </label>
      {/if}

      <div class="barre-boutons">
        <lab-anssi-lien
          titre="Retour au tableau de bord"
          apparence="bouton"
          variante="tertiaire"
          taille="md"
          positionIcone="sans"
          href="/tableauDeBord"
        />
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <lab-anssi-bouton
          titre={estEtapeFinale ? 'Finaliser' : 'Suivant'}
          variante="primaire"
          taille="md"
          icone={estEtapeFinale ? 'check-line' : 'arrow-right-line'}
          positionIcone="droite"
          actif={donneesService.nomService.length > 0 && !chargementEnCours}
          on:click={async () =>
            estEtapeFinale ? finaliseBrouillon() : creeBrouillon()}
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

        label {
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
