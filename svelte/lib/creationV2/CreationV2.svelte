<script lang="ts">
  import ChampTexte from '../ui/ChampTexte.svelte';
  import { creeBrouillonService } from './creationV2.api';

  let nomService = '';
</script>

<div class="conteneur-creation">
  <div class="formulaire-creation">
    <div class="contenu-formulaire">
      <h1>Ajouter un service</h1>

      <label for="nom-service">
        Quel est le nom de votre service ?
        <ChampTexte id="nom-service" nom="nom-service" bind:valeur={nomService}
        ></ChampTexte>
      </label>

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
          titre="Suivant"
          variante="primaire"
          taille="md"
          icone="arrow-right-line"
          positionIcone="droite"
          actif={nomService.length > 0}
          on:click={async () => creeBrouillonService(nomService)}
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
