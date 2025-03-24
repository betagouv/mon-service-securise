<script lang="ts">
  export let variation: 'attenue' | 'defaut' = 'defaut';
</script>

<div class={variation}>
  <slot />
</div>

<style>
  div {
    padding: 48px 16px;
    text-align: left;
  }

  .attenue {
    background: #eaf5ff;
  }

  :global(.attenue h1) {
    color: #09416a;
  }
</style>
