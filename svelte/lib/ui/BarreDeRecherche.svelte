<script lang="ts">
  interface Props {
    recherche: string;
  }

  let { recherche = $bindable() }: Props = $props();

  const metsAJourRecherche = (e: CustomEvent<string>) => (recherche = e.detail);
</script>

<dsfr-search
  placeholder="Rechercher"
  onvaluechanged={metsAJourRecherche}
  input-id="recherche"
  input-label="Rechercher"
  button-label="Rechercher"
  value={recherche}
></dsfr-search>

<style>
  dsfr-search {
    min-width: 328px;
  }
</style>
