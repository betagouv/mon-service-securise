<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    titre: string;
    sousTitre: string;
    children?: Snippet;
    slotToggle?: Snippet;
  }

  let { children, titre, sousTitre, slotToggle }: Props = $props();
</script>

<div class="bloc-preferences">
  <div class="entete-preferences">
    <div class="titre-preferences">
      <h2>{titre}</h2>
      <p>
        {sousTitre}
      </p>
    </div>
    {@render slotToggle?.()}
  </div>
  <div class="contenu-preferences">
    {@render children?.()}
  </div>
</div>

<style lang="scss">
  .bloc-preferences {
    .contenu-preferences {
      padding: 32px 0;
    }

    .entete-preferences {
      display: flex;
      justify-content: space-between;
    }

    h2 {
      color: #161616;
      font-size: 1.375rem;
      line-height: 1.75rem;
      margin: 0;
    }

    p {
      padding: 0;
      color: #3a3a3a;
      font-size: 0.875rem;
      line-height: 1.5rem;
      margin: 8px 0 0;
    }
  }
</style>
