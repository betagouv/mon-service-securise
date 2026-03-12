<script lang="ts">
  interface Props {
    variation?: 'attenue' | 'primaire' | 'defaut';
    sansMargeLaterale?: boolean;
    classe?: string;
    children?: import('svelte').Snippet;
  }

  let {
    variation = 'defaut',
    sansMargeLaterale = false,
    classe = '',
    children,
  }: Props = $props();
</script>

<div class="bloc {variation}" class:sans-marge-laterale={sansMargeLaterale}>
  <div class="contenu-bloc {classe ?? ''}">
    {@render children?.()}
  </div>
</div>

<style>
  .bloc {
    padding: 48px 16px;
    text-align: left;
    width: calc(100vw - 32px);
  }

  .contenu-bloc {
    max-width: 1200px;
    margin: 0 auto;
  }

  @media screen and (min-width: 577px) {
    .bloc:not(.sans-marge-laterale) {
      padding: 72px 24px;
      width: calc(100vw - 48px);
    }
  }

  .sans-marge-laterale {
    padding: 48px 0;
    width: 100vw;
  }

  .attenue {
    background: #eaf5ff;
  }

  :global(.attenue h1),
  :global(.attenue h2),
  :global(.defaut h2) {
    color: #09416a;
  }

  .primaire {
    background: var(--bleu-mise-en-avant);
  }

  :global(.primaire) {
    color: white;
  }

  .defaut {
    background: white;
  }
</style>
