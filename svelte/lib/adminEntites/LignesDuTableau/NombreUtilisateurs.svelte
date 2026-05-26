<script lang="ts">
  interface Props {
    nombreUtilisateurs: number;
  }

  let { nombreUtilisateurs }: Props = $props();
</script>

<span>
  {#if nombreUtilisateurs === 0}
    Aucun utilisateur
  {:else}
    {nombreUtilisateurs} utilisateur{nombreUtilisateurs > 1 ? 's' : ''}
  {/if}
</span>
