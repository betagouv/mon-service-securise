<script lang="ts">
  interface Props {
    children?: import('svelte').Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="contenu-tiroir">
  {@render children?.()}
</div>

<style>
  .contenu-tiroir {
    display: flex;
    flex-direction: column;
    flex: 1;
    text-align: left;
    padding: 32px;
    gap: 30px;
  }
</style>
