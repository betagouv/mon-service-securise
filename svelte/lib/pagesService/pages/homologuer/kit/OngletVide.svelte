<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    titre: string;
    sousTitre: string;
    children?: Snippet;
  }

  let { titre, sousTitre, children }: Props = $props();
</script>

<div class="conteneur-projets-vide">
  <img
    src="/statique/assets/images/illustration_dossiers.svg"
    alt="Illustration du dossier d'homologation vide"
  />
  <div>
    <h4>{titre}</h4>
    <span>{sousTitre} </span>
  </div>
  {@render children?.()}
</div>

<style lang="scss">
  .conteneur-projets-vide {
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: center;
    align-items: center;
    max-width: 588px;
    color: #161616;
    margin: 0 auto;
    text-align: center;

    & > div {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }

    img {
      max-width: 200px;
    }

    h4 {
      font-weight: bold;
      font-size: 1.5rem;
      line-height: 2rem;
      margin: 0;
    }

    span {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
  }
</style>
