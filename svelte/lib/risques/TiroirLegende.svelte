<script lang="ts">
  interface Props {
    ouvert: boolean;
    titre?: string;
    sousTitre?: string;
    children?: import('svelte').Snippet;
  }

  let {
    ouvert = $bindable(),
    titre = '',
    sousTitre = '',
    children,
  }: Props = $props();

  const fermeTiroir = () => {
    ouvert = false;
  };
</script>

<div class="tiroir-legende" class:ouvert>
  <div class="entete-tiroir">
    <div>
      <h2 class="titre-tiroir-legende">{titre}</h2>
    </div>
    <button class="fermeture" onclick={fermeTiroir}>✕</button>
  </div>
  <div class="contenu-legende">
    <h3>{sousTitre}</h3>
    {@render children?.()}
  </div>
</div>

<style>
  .tiroir-legende {
    height: 100%;
    min-width: 650px;
    max-width: 650px;
    position: fixed;
    left: 100vw;
    top: 0;
    overflow-y: scroll;
    transition: transform 0.2s ease-in-out;
    box-shadow: -10px 0 34px 0 #00000026;
    background: #fff;
    visibility: hidden;
    z-index: 20;
    display: flex;
    flex-direction: column;
  }

  h3 {
    margin: 0;
    line-height: 1.375rem;
    font-size: 1rem;
  }

  .ouvert {
    transform: translateX(-100%);
    visibility: visible;
  }

  .entete-tiroir {
    background: #f1f5f9;
    text-align: left;
    padding: 32px;
    overflow: hidden;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .fermeture {
    font-weight: bold;
    background: none;
    width: 2em;
    height: 2em;
    cursor: pointer;
    border: none;
  }

  .titre-tiroir-legende {
    font-size: 1.625rem;
    margin: 0;
  }

  .contenu-legende {
    text-align: left;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
  }
</style>
