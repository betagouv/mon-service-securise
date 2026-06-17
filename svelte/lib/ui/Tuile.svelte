<script lang="ts">
  interface Props {
    nomSvg: string;
    titre: string;
    description: string;
  }

  let { nomSvg, titre, description }: Props = $props();
</script>

<dsfr-tile
  title={titre}
  has-description
  {description}
  horizontal
  action-markup="false"
  no-link
  no-icon
  size="sm"
  markup-level="2"
>
  <img
    slot="pictogram"
    src={`/statique/assets/images/${nomSvg}.svg`}
    alt=""
    width="40"
    height="40"
  />
</dsfr-tile>

<style lang="scss">
  dsfr-tile {
    width: 360px;
  }
</style>
