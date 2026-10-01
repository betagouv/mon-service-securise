<script lang="ts">
  import type { GroupesProps } from './groupes.d';

  let { groupes }: GroupesProps = $props();
</script>

<h1>Mes groupes</h1>

{#if groupes.length === 0}
  <div class="aucun-groupe">
    <img src="/statique/assets/images/illustration_recherche_vide.svg" alt="" />
    <p>Aucun groupe pour le moment.</p>
  </div>
{/if}

<style lang="scss">
  :global(main:has(#conteneur-groupes)) {
    background: white;
    text-align: left;
  }

  :global(#conteneur-groupes) {
    width: 792px;
  }

  h1 {
    color: #161616;
    font-size: 2rem;
    line-height: 2.5rem;
    margin: 56px 0 0;
  }

  .aucun-groupe {
    padding: 36px 0;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-direction: column;
    color: #161616;

    img {
      max-width: 128px;
      transform: scaleX(-1);
    }

    p {
      margin: 0;
      font-size: 1.25rem;
      line-height: 2rem;
      font-weight: bold;
    }
  }
</style>
