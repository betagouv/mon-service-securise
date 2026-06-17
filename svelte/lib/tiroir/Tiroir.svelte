<script lang="ts">
  import {
    type ConfigurationTiroir,
    tiroirStore,
  } from '../ui/stores/tiroir.store';
  import type { SvelteComponent } from 'svelte';

  let composant: SvelteComponent | undefined = $state();
  let configuration: ConfigurationTiroir = $derived(
    composant as unknown as ConfigurationTiroir
  );
</script>

<div
  id="tiroir"
  class={configuration?.taille || 'normal'}
  class:ouvert={$tiroirStore.ouvert}
>
  {#key $tiroirStore}
    {#if $tiroirStore.contenu}
      <div class="entete-tiroir">
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          preset="close"
          onclick={() => tiroirStore.ferme()}
          label="Fermer"
        >
        </dsfr-button>
        <div class="titre-tiroir">
          <h3>{configuration?.titre}</h3>
          {#if configuration?.sousTitre}
            <p>
              {configuration.sousTitre}
            </p>
          {/if}
        </div>
        {#if configuration?.composantEntete}
          {@const ComposantEntete = configuration.composantEntete}
          <ComposantEntete {...configuration.propsComposantEntete} />
        {/if}
      </div>
      {@const Composant = $tiroirStore.contenu.composant}
      <Composant bind:this={composant} {...$tiroirStore.contenu.props} />
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
    width: 900px;
  }

  #tiroir.ouvert {
    transform: translateX(-100%);
    visibility: visible;
  }

  .entete-tiroir {
    background: #eaf5ff;
    text-align: left;
    padding: 36px;
    overflow: hidden;
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    gap: 10px;

    dsfr-button {
      align-self: flex-start;
    }
  }

  .titre-tiroir {
    display: flex;
    flex-direction: column;
    gap: 8px;

    h3 {
      font-size: 1.75rem;
      line-height: 2.25rem;
      font-weight: 700;
      color: #000;
      margin: 0;
      padding: 0;
    }

    p {
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5rem;
      color: #3a3a3a;
      margin: 0;
      padding: 0;
    }
  }
</style>
