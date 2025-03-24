<script lang="ts">
  export let variation: 'attenue' | 'primaire' | 'defaut' = 'defaut';
  export let sansMargeLaterale = false;
</script>

<div class={variation} class:sans-marge-laterale={sansMargeLaterale}>
  <slot />
</div>

<style>
  div {
    padding: 48px 16px;
    text-align: left;
    width: calc(100vw - 32px);
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
