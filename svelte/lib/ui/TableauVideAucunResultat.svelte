<script lang="ts">
  interface Props {
    onclick: (e: MouseEvent) => void;
  }

  let { onclick }: Props = $props();
</script>

<div class="aucun-resultat">
  <img src="/statique/assets/images/illustration_recherche_vide.svg" alt="" />
  Aucune mesure ne correspond à la recherche.
  <button class="bouton bouton-secondaire" {onclick}>
    Effacer la recherche
  </button>
</div>

<style lang="scss">
  .aucun-resultat {
    padding: 64px 0;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: column;
    color: var(--texte-clair);

    img {
      max-width: 128px;
    }

    button {
      margin: 0;
      padding: 8px 16px;
    }
  }
</style>
