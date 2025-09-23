<script lang="ts">
  import ChampTexte from '../../ui/ChampTexte.svelte';
  import { createEventDispatcher, tick } from 'svelte';

  export let valeurs: string[];
  export let nomGroupe: string;
  export let titreSuppression: string;
  export let titreAjout: string;

  const dispatche = createEventDispatcher<{
    suppression: number;
    ajout: void;
  }>();
</script>

{#each valeurs as valeur, index}
  <div class={`conteneur-champs-texte`}>
    <ChampTexte
      id={`${nomGroupe}-${index}`}
      nom={nomGroupe}
      bind:valeur
      on:blur
    />
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre={titreSuppression}
      variante="tertiaire"
      taille="lg"
      icone="delete-line"
      positionIcone="seule"
      on:click={() => dispatche('suppression', index)}
    />
  </div>
{/each}
<div class="conteneur-actions">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <lab-anssi-bouton
    titre={titreAjout}
    variante="tertiaire"
    taille="md"
    icone="add-line"
    positionIcone="gauche"
    on:click={() => dispatche('ajout')}
  />
</div>

<style lang="scss">
  .conteneur-champs-texte {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;

    :global(input) {
      width: 100%;
    }
  }

  .conteneur-actions {
    width: fit-content;
  }
</style>
