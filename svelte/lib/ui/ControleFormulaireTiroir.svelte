<script lang="ts">
  interface Props {
    libelle: string;
    requis?: boolean;
    children?: import('svelte').Snippet;
  }

  let { libelle, requis = false, children }: Props = $props();
</script>

<label>
  <span class:requis class="libelle">{libelle}</span>
  <span class="contenu">
    {@render children?.()}
  </span>
</label>

<style>
  .contenu {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 16px;
    font-weight: normal;
    margin: 0;
  }

  .libelle {
    font-weight: bold;
    font-size: 1rem;
    line-height: 1.375rem;
  }

  .requis:before {
    content: '*';
    color: #e3271c;
    margin-right: 4px;
    font-size: 1rem;
  }
</style>
