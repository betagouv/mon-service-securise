<script lang="ts">
  import { onMount } from 'svelte';
  import type { Entite } from '../ui/types';
  import { api } from './adminEntites.api';

  let mesEntites: Entite[] = $state([]);

  onMount(async () => {
    mesEntites = await api.entitesDansMonPerimetre();
  });
</script>

<h1>Entités</h1>

<dsfr-table
  columns={[
    { key: 'siret', label: 'SIRET' },
    { key: 'nom', label: 'Nom' },
    { key: 'departement', label: 'Département' },
  ]}
  rows={mesEntites}
></dsfr-table>

<style lang="scss">
  :global(#conteneur-admin-entites) {
    text-align: left;
    background: #fff;
    width: 100%;
    padding: 32px 48px;
  }

  h1 {
    font-size: 2.5rem;
    line-height: 3rem;
    margin: 0;
  }
</style>
