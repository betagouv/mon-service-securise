<script lang="ts" context="module">
  import type { OptionsListeDeroulanteRiche } from './ui.types';
  export type ConfigurationRecherche = {
    champsRecherche: string[];
  };

  export type ConfigurationFiltrage = {
    options: OptionsListeDeroulanteRiche<any>;
  };

  export type ConfigurationSelection = {
    texteIndicatif: {
      vide: string;
      unique: string;
      multiple: string;
    };
    champSelection: string;
    predicatSelectionDesactive?: (donnee: T) => boolean;
  };
</script>

<script lang="ts" generics="T extends ObjetDeDonnees">
  import type { ObjetDeDonnees } from './types';
  import TableauVideAucunResultat from './TableauVideAucunResultat.svelte';
  import ListeDeroulanteRiche from './ListeDeroulanteRiche.svelte';
  import BarreDeRecherche from './BarreDeRecherche.svelte';
  import type { ComponentType } from 'svelte';

  export let colonnes: { cle: string; libelle: string }[];
  export let donnees: T[];

  export let configurationRecherche: ConfigurationRecherche | null = null;
  export let configurationFiltrage: ConfigurationFiltrage | null = null;
  export let configurationSelection: ConfigurationSelection | null = null;
  export let selection: string[] = [];
  export let preSelectionImmuable: string[] = [];
  export let champIdentifiantLigne: string = '';
  export let composantTableauVide:
    | { composant: ComponentType; props: Record<string, any> }
    | undefined = undefined;

  let recherche: string = '';
  let filtrage: Record<string, any> = {};
  const effaceRechercheEtFiltres = () => {
    recherche = '';
    filtrage = Object.fromEntries(
      Object.entries(filtrage).map(([cle, _]) => [cle, []])
    );
  };

  let donneesFiltrees: T[] = [];
  $: donneesFiltreesSelectionnables = donneesFiltrees.filter((donnee) =>
    configurationSelection?.predicatSelectionDesactive
      ? !configurationSelection.predicatSelectionDesactive(donnee)
      : true
  );
  $: {
    donneesFiltrees = donnees;

    if (configurationRecherche && recherche)
      donneesFiltrees = donneesFiltrees.filter((donnee) =>
        configurationRecherche.champsRecherche.some((champ) =>
          donnee[champ]?.toLowerCase().includes(recherche.toLowerCase())
        )
      );

    if (configurationFiltrage && filtrage) {
      Object.entries(filtrage).forEach(([cleFiltrage, valeurs]) => {
        if (valeurs && valeurs.length)
          donneesFiltrees = donneesFiltrees.filter((d) => {
            const donnee = d[cleFiltrage];
            if (Array.isArray(donnee)) {
              return donnee.some((v) => valeurs.includes(v));
            }
            return valeurs.includes(donnee);
          });
      });
    }
  }

  const nbColonnes = colonnes.length + (configurationSelection ? 1 : 0);

  const videSelectionSansReactivite = () => {
    selection = [];
  };

  $: toutEstSelectionne =
    selection.length !== 0 &&
    selection.length === donneesFiltreesSelectionnables.length;
  $: {
    if (recherche || filtrage) {
      // On appelle ici une méthode plutot que de vider nous même `selection` afin de ne pas
      // déclencher cette même réactivité
      videSelectionSansReactivite();
    }
  }
  const basculeSelectionTous = () => {
    if (!configurationSelection) return;
    if (toutEstSelectionne) selection = [];
    else
      selection = donneesFiltreesSelectionnables.map(
        (donnee) => donnee[configurationSelection.champSelection]
      );
  };
</script>

<div class="conteneur-tableau">
  {#if configurationRecherche || configurationFiltrage}
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
      <slot name="actionsComplementaires" />
    </div>
  {/if}
  <div>
    <slot name="onglets" />
    <table>
      {#if composantTableauVide}
        <svelte:component
          this={composantTableauVide.composant}
          {...composantTableauVide.props}
        />
      {:else}
        <thead>
          <slot name="barre-action-dans-thead" />
          {#if configurationSelection}
            {@const { vide, unique, multiple } =
              configurationSelection.texteIndicatif}
            <tr>
              <th colspan={nbColonnes} class="ligne-texte-selection">
                {selection.length === 0
                  ? vide
                  : selection.length === 1
                  ? `1 ${unique}`
                  : `${selection.length} ${multiple}`}
              </th>
            </tr>
          {/if}
          <tr>
            {#if configurationSelection}
              <th class="cellule-selection">
                <div>
                  <input
                    type="checkbox"
                    on:change={basculeSelectionTous}
                    disabled={donneesFiltrees.length === 0 ||
                      preSelectionImmuable.length === donnees.length}
                    checked={toutEstSelectionne && donneesFiltrees.length > 0}
                    indeterminate={!toutEstSelectionne && selection.length > 0}
                    title="Sélection de tous"
                  />
                </div>
              </th>
            {/if}
            {#each colonnes as colonne (colonne.cle)}
              <th>{colonne.libelle}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each donneesFiltrees as donnee, index (index)}
            <tr
              id={champIdentifiantLigne
                ? `ligne-${donnee[champIdentifiantLigne]}`
                : undefined}
            >
              {#if configurationSelection}
                {@const id = donnee[configurationSelection.champSelection]}
                {@const estImmuable = preSelectionImmuable.includes(id)}
                <td class="cellule-selection">
                  <div>
                    {#if estImmuable}
                      <input
                        type="checkbox"
                        value={id}
                        title="Sélection du service {donnee[
                          configurationSelection.champSelection
                        ]}"
                        disabled={true}
                        checked={true}
                      />
                    {:else}
                      <input
                        type="checkbox"
                        bind:group={selection}
                        value={id}
                        title="Sélection du service {donnee[
                          configurationSelection.champSelection
                        ]}"
                        disabled={configurationSelection.predicatSelectionDesactive?.(
                          donnee
                        )}
                      />
                    {/if}
                  </div>
                </td>
              {/if}
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
              <td colspan={nbColonnes}>
                <TableauVideAucunResultat on:click={effaceRechercheEtFiltres} />
              </td>
            </tr>
          {/if}
        </tbody>
      {/if}
    </table>
  </div>
</div>

<style lang="scss">
  .filtres {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
  }

  .conteneur-tableau {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    color: #3a3a3a;
    font-size: 0.875rem;
    line-height: 1.5rem;

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

  .ligne-texte-selection {
    border: 1px solid #dddddd;
    color: var(--light-decisions-text-text-mention-grey, #666);
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5rem;
  }

  .cellule-selection {
    border-right: 1px solid #dddddd;
    width: 0;

    & > div {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  input[type='checkbox'] {
    appearance: none;
    border-radius: 4px;
    border: 1px solid #042794;
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
    transform: none;

    &:checked,
    &:indeterminate {
      background: var(--bleu-mise-en-avant);
      border-color: var(--bleu-mise-en-avant);
    }

    &:checked::before {
      content: '';
      width: 4px;
      height: 8px;
      border-right: 1.5px solid white;
      border-bottom: 1.5px solid white;
      display: block;
      transform: translate(4px, 1px) rotate(45deg);
      margin: 0;
    }

    &:focus-visible {
      outline: 2px solid var(--bleu-mise-en-avant);
      outline-offset: 2px;
    }

    &:indeterminate::before {
      content: '';
      height: 8px;
      border-bottom: 1.5px solid white;
      display: block;
      transform: translate(4px, -1.5px) rotate(0);
      border-right: 0;
      width: 6px;
    }

    &:disabled {
      cursor: not-allowed;
      border-color: #dddddd;
      background-color: #e5e5e5;

      &::before {
        border-color: #929292;
      }
    }
  }
</style>
