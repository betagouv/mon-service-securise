<script>
  import { tiroirStore } from '../ui/stores/tiroir.store';
</script>

<div id="tiroir" class:ouvert={$tiroirStore.ouvert}>
  {#key $tiroirStore}
    {#if $tiroirStore.contenu}
      <div class="entete-tiroir">
        <button class="fermeture-tiroir" on:click={() => tiroirStore.ferme()}>
          ✕
        </button>
        <h2 class="titre-tiroir">{$tiroirStore.contenu.configuration.titre}</h2>
        <p class="texte-tiroir">
          {$tiroirStore.contenu.configuration.sousTitre}
        </p>
      </div>
      <svelte:component
        this={$tiroirStore.contenu.composant}
        {...$tiroirStore.contenu.props}
      />
    {/if}
  {/key}
</div>

<style>
  #tiroir {
    height: 100%;
    min-width: 650px;
    max-width: 650px;
    position: fixed;
    left: 100vw;
    top: 0;
    overflow-y: scroll;
    transition: transform 0.2s ease-in-out;
    box-shadow: -10px 0px 34px 0px #00000026;
    background: #fff;
    visibility: hidden;
    z-index: 20;
    display: flex;
    flex-direction: column;
    color: var(--texte-fonce);
  }

  #tiroir.ouvert {
    transform: translateX(-100%);
    visibility: visible;
  }

  .entete-tiroir {
    position: relative;
    background: #dbecf1;
    text-align: left;
    padding: 32px;
    overflow: hidden;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .titre-tiroir {
    font-size: 1.6em;
    margin: 0;
  }

  .texte-tiroir {
    margin: 0;
    padding-top: 0.8em;
    font-weight: 500;
    padding-bottom: 30px;
  }

  .fermeture-tiroir {
    position: absolute;
    top: 32px;
    right: 32px;
    border: none;
    background: none;
    cursor: pointer;
  }
</style>
