<script lang="ts">
  interface Props {
    href: string;
    titre: string;
    illustration?: string;
    description?: string;
  }

  let { href, titre, illustration, description }: Props = $props();
</script>

<dsfr-card
  title={titre}
  markup="h3"
  action-markup="a"
  {href}
  size="sm"
  {...illustration ? { src: illustration } : {}}
  image-ratio="3x4"
  horizontal-proportion="tier"
  {...description ? { 'has-description': true, description } : {}}
  {...href.startsWith('/') ? {} : { blank: true }}
  horizontal
  has-links
  enlarge
></dsfr-card>

<style lang="scss">
  dsfr-card {
    flex: 1 1 0;
  }
</style>
