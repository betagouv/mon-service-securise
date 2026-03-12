<script lang="ts">
  interface Props {
    contenu?: string;
    enErreur?: boolean;
    large?: boolean;
    gras?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    contenu = '',
    enErreur = false,
    large = false,
    gras = false,
    children,
  }: Props = $props();
</script>

<td class:enErreur class:large class:gras>
  {#if children}{@render children()}{:else}
    {contenu || '-'}
  {/if}
</td>

<style lang="scss">
  td {
    font-size: 0.875rem;
    line-height: 1.5rem;
    padding: 8px 16px;
    max-width: 188px;
    text-align: left;
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    border-bottom: 1px solid var(--systeme-design-etat-contour-champs);
    color: #3a3a3a;
  }

  .enErreur {
    color: var(--erreur-texte);
    font-weight: 700;
  }

  .large {
    min-width: 200px;
  }

  .gras {
    font-weight: 700;
  }
</style>
