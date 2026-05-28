<script lang="ts">
  interface Props {
    identifiant?: string;
  }

  let { identifiant = '' }: Props = $props();
</script>

{#if identifiant}
  <dsfr-tag label="#{identifiant}" size="sm"></dsfr-tag>
{/if}
