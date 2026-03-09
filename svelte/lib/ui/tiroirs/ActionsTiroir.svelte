<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="conteneur-actions">
  {@render children?.()}
</div>

<style>
  .conteneur-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    position: sticky;
    bottom: 0;
    border-top: 1px solid #cbd5e1;
    padding: 19px 32px;
    background: white;
    flex-grow: 0;
    flex-shrink: 0;
    gap: 10px;
  }
</style>
