<script lang="ts">
  interface Props {
    recherche: string;
  }

  // eslint-disable-next-line no-useless-assignment
  let { recherche = $bindable() }: Props = $props();

  const metsAJourRecherche = (e: CustomEvent<string>) => (recherche = e.detail);
</script>

<dsfr-search
  placeholder="Rechercher"
  onvaluechanged={metsAJourRecherche}
  input-id="recherche"
  input-label="Rechercher"
  button-label="Rechercher"
></dsfr-search>

<style>
  dsfr-search {
    min-width: 328px;
  }
</style>
