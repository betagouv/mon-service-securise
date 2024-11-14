<script lang="ts">
  import type { ItemFilAriane } from './ui.types.d';
  export let items: ItemFilAriane[];
</script>

<div class="conteneur-fil-ariane">
  {#each items as item, index}
    {#if item.lien}
      <a href={item.lien}>{item.label}</a>
    {:else}
      <span>{item.label}</span>
    {/if}

    {#if index < items.length - 1}
      <img
        src="/statique/assets/images/ui-kit/chevron_droite.svg"
        alt="Icône de chevron du fil d'Ariane"
      />
    {/if}
  {/each}
</div>

<style>
  .conteneur-fil-ariane {
    font-size: 0.83em;
    line-height: 1.68em;
    color: var(--texte-fonce);
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: end;
  }

  a {
    color: var(--texte-gris);
    text-decoration: underline;
  }
</style>
