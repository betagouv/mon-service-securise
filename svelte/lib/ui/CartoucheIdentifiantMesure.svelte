<script lang="ts">
  export let identifiant: string;
</script>

{#if identifiant}
  <span class="identifiant-numerique">#{identifiant}</span>
{/if}

<style>
  .identifiant-numerique {
    color: var(--texte-clair);
    font-size: 12px;
    font-weight: 700;
  }
</style>
