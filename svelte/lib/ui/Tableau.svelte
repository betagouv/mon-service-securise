<script lang="ts" generics="T extends ObjetDeDonnees">
  import TableauVideAucunResultat from './TableauVideAucunResultat.svelte';
  import ListeDeroulanteRiche from './ListeDeroulanteRiche.svelte';
  import BarreDeRecherche from './BarreDeRecherche.svelte';
  import type { OptionsListeDeroulanteRiche } from './ui.types';
  import type { ObjetDeDonnees } from './types';

  type ConfigurationRecherche = {
    champsRecherche: string[];
  };

  type ConfigurationFiltrage = {
    options: OptionsListeDeroulanteRiche<any>;
  };

  export let colonnes: { cle: string; libelle: string }[];
  export let donnees: T[];

  export let configurationRecherche: ConfigurationRecherche | null = null;
  export let configurationFiltrage: ConfigurationFiltrage | null = null;

  let recherche: string = '';
  let filtrage: Record<string, any> = {};
  const effaceRechercheEtFiltres = () => {
    recherche = '';
  };

  let donneesFiltrees: T[] = [];
  $: {
    donneesFiltrees = donnees;

    if (configurationRecherche && recherche)
      donneesFiltrees = donneesFiltrees.filter((donnee) =>
        configurationRecherche.champsRecherche.some((champ) =>
          donnee[champ].toLowerCase().includes(recherche.toLowerCase())
        )
      );

    if (configurationFiltrage && filtrage) {
      Object.entries(filtrage).forEach(([cleFiltrage, valeurs]) => {
        if (valeurs && valeurs.length)
          donneesFiltrees = donneesFiltrees.filter((d) =>
            valeurs.includes(d[cleFiltrage])
          );
      });
    }
  }
</script>

<div class="filtres">
  {#if configurationRecherche}
    <BarreDeRecherche bind:recherche />
  {/if}
  {#if configurationFiltrage}
    <ListeDeroulanteRiche
      bind:valeursSelectionnees={filtrage}
      id="filtres-tableau"
      libelle="Filtrer"
      options={configurationFiltrage.options}
    />
  {/if}
</div>
<table>
  <thead>
    <tr>
      {#each colonnes as colonne (colonne.cle)}
        <th>{colonne.libelle}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each donneesFiltrees as donnee, index (index)}
      <tr>
        {#each colonnes as colonne (colonne.cle)}
          <td>
            <slot name="cellule" {donnee} {colonne}>
              {donnee[colonne.cle]}
            </slot>
          </td>
        {/each}
      </tr>
    {/each}
    {#if donneesFiltrees.length === 0}
      <tr>
        <td colspan={colonnes.length}>
          <TableauVideAucunResultat on:click={effaceRechercheEtFiltres} />
        </td>
      </tr>
    {/if}
  </tbody>
</table>

<style lang="scss">
  .filtres {
    display: flex;
    flex-direction: row;
    gap: 12px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;
    margin-top: 24px;

    thead {
      border: 1px solid #dddddd;

      th {
        white-space: nowrap;
        padding: 8px 16px;
        color: #666666;
        font-weight: bold;
      }
    }

    tbody {
      border: 1px solid #dddddd;

      td {
        padding: 8px 16px;
        border-top: 1px solid #dddddd;
      }
    }
  }
</style>
