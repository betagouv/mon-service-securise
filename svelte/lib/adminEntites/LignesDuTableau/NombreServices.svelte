<script lang="ts">
  interface Props {
    nombreServices: number;
  }

  let { nombreServices }: Props = $props();
</script>

<span>
  {#if nombreServices === 0}
    Aucun service
  {:else}
    {nombreServices} service{nombreServices > 1 ? 's' : ''}
  {/if}
</span>
