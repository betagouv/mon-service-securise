<script lang="ts">
  interface Props {
    onclick: (e: MouseEvent) => void;
  }
  let { onclick }: Props = $props();
</script>

<button type="button" {onclick} aria-label="Supprimer le contributeur">
  <img
    class="bouton-suppression-contributeur"
    src="/statique/assets/images/icone_supprimer_gris.svg"
    alt=""
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
