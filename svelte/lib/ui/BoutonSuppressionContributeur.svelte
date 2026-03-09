<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
</script>

<button type="button" onclick={bubble('click')}>
  <img
    class="bouton-suppression-contributeur"
    src="/statique/assets/images/icone_supprimer_gris.svg"
    alt="bouton de suppression d'un contributeur"
  />
</button>

<style>
  button {
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
</style>
