<script lang="ts">
  export let icone:
    | 'information'
    | 'tri-aucun'
    | 'tri-ascendant'
    | 'tri-descendant';
</script>

<button type="button" class={icone} on:click></button>

<style>
  button {
    display: flex;
    border: none;
    background-color: transparent;
  }

  button:before {
    content: '';
    display: inline-block;
    background-repeat: no-repeat;
    background-size: contain;
    cursor: pointer;
  }

  .information:before {
    width: 18px;
    height: 18px;
    background-image: url('/statique/assets/images/icone_information.svg');
    filter: brightness(0) saturate(100%) invert(44%) sepia(44%) saturate(243%)
      hue-rotate(176deg) brightness(96%) contrast(92%);
  }

  .tri-aucun:before {
    width: 24px;
    height: 24px;
    background-image: url('/statique/assets/images/icone_tri_aucun.svg');
    filter: invert(49%) sepia(5%) saturate(2221%) hue-rotate(176deg)
      brightness(92%) contrast(84%);
  }

  .tri-ascendant:before {
    width: 24px;
    height: 24px;
    background-image: url('/statique/assets/images/icone_tri_croissant.svg');
    filter: none;
  }

  .tri-descendant:before {
    width: 24px;
    height: 24px;
    background-image: url('/statique/assets/images/icone_tri_decroissant.svg');
    filter: none;
  }
</style>
