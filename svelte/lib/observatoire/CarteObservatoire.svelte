<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    titre: string;
    dateDonnees?: string;
    children: Snippet;
  }

  let { titre, dateDonnees, children }: Props = $props();
</script>

<section class="carte">
  <h2>{titre}</h2>
  <div class="contenu">
    {@render children()}
  </div>
  <p class="source">
    MonServiceSécurisé{dateDonnees ? `, ${dateDonnees}` : ''}
  </p>
</section>

<style lang="scss">
  .carte {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    background: #fff;
    min-width: 0;

    h2 {
      margin: 0;
      color: #161616;
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1.75rem;
    }

    .contenu {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
    }

    .source {
      margin: 0;
      color: #3a3a3a;
      font-size: 0.75rem;
      line-height: 1.25rem;
    }
  }
</style>
