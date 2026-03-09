<script lang="ts">
  interface Props {
    identifiant?: string;
  }

  let { identifiant = '' }: Props = $props();
</script>

{#if identifiant}
  <span class="identifiant-numerique">#{identifiant}</span>
{/if}

<style>
  .identifiant-numerique {
    color: var(--texte-clair);
    padding: 1px 8px 3px;
    font-size: 12px;
    font-weight: 700;
  }
</style>
