<script lang="ts">
  import { infobulle } from './directives/infobulle';

  interface Props {
    contenu: string;
    enfantDirect?: boolean;
  }

  let { contenu, enfantDirect = false }: Props = $props();
</script>

<div class="conteneur-image" use:infobulle={[contenu, enfantDirect]}>
  <img src="/statique/assets/images/icone_infobulle.svg" alt={contenu} />
</div>

<style lang="scss">
  .conteneur-image {
    padding: 8px 8px 4px 8px;
    cursor: help;
    display: flex;
  }
</style>
