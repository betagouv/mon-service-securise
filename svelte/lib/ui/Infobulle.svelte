<script lang="ts">
  import { infobulle } from './directives/infobulle';

  export let contenu: string;
</script>

<div class="conteneur-image" use:infobulle={contenu}>
  <img src="/statique/assets/images/icone_infobulle.svg" alt={contenu} />
</div>

<style lang="scss">
  .conteneur-image {
    padding: 8px 8px 4px 8px;
    cursor: help;
  }
</style>
