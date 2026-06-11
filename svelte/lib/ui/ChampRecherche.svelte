<script lang="ts">
  interface Props {
    valeur: string;
  }

  let { valeur = $bindable() }: Props = $props();
</script>

<dsfr-search
  size="md"
  value={valeur}
  input-id="champ-recherche"
  input-label="Rechercher"
  button-title="Rechercher"
  placeholder="Rechercher"
  onvaluechanged={(e: CustomEvent<string>) => (valeur = e.detail)}
></dsfr-search>

<style lang="scss">
  dsfr-search {
    max-width: 288px;
  }
</style>
