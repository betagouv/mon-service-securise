<script lang="ts">
  import {
    type ConfigurationTiroir,
    tiroirStore,
  } from '../ui/stores/tiroir.store';

  let composant: ConfigurationTiroir;
</script>

<div
  id="tiroir"
  class={composant?.taille || 'normal'}
  class:ouvert={$tiroirStore.ouvert}
>
  {#key $tiroirStore}
    {#if $tiroirStore.contenu}
      <div class="entete-tiroir">
        <button class="fermeture-tiroir" on:click={() => tiroirStore.ferme()}>
          Fermer
        </button>
        <h2 class="titre-tiroir">{composant?.titre}</h2>
        <p class="texte-tiroir">
          {composant?.sousTitre}
        </p>
      </div>
      <svelte:component
        this={$tiroirStore.contenu.composant}
        bind:this={composant}
        {...$tiroirStore.contenu.props}
      />
    {/if}
  {/key}
</div>

<style>
  #tiroir {
    height: 100%;
    position: fixed;
    left: 100vw;
    top: 0;
    overflow-y: scroll;
    transition: transform 0.2s ease-in-out;
    box-shadow: -10px 0px 34px 0px #00000026;
    background: #fff;
    visibility: hidden;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    color: var(--texte-fonce);
  }

  #tiroir.normal {
    width: 650px;
  }

  #tiroir.large {
    width: 830px;
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
    padding-bottom: 0;
    max-width: 650px;
  }

  .fermeture-tiroir {
    position: absolute;
    top: 32px;
    right: 32px;
    border: none;
    background: none;
    cursor: pointer;
    color: var(--bleu-mise-en-avant);
    border-radius: 4px;
    padding: 4px 8px 4px 12px;
    font-size: 0.875em;
  }

  .fermeture-tiroir::after {
    content: '✕';
    display: inline-flex;
    margin-left: 8px;
  }

  .fermeture-tiroir:hover {
    background-color: #f5f5f5;
  }
</style>
