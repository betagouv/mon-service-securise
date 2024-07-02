<script lang="ts">
  export let filtresActifs: boolean = false;
</script>

<picture class:filtres-actifs={filtresActifs}>
  <img src="/statique/assets/images/icone_filtre.svg" alt="" />
</picture>
Filtres

<style>
  picture {
    height: 24px;
    width: 24px;
  }

  .filtres-actifs::after {
    display: block;
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1px solid white;
    background: var(--bleu-mise-en-avant);
    position: relative;
    top: -28px;
    left: 18px;
  }
</style>
