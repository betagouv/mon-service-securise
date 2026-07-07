<script lang="ts">
  import FermetureSurClicEnDehors from './FermetureSurClicEnDehors.svelte';
  import Pastille from './Pastille.svelte';
  import type { OptionsListeDeroulanteRiche } from './ui.types.d';

  interface Props {
    id: string;
    libelle: string;
    options: OptionsListeDeroulanteRiche<string>;
    valeursSelectionnees?: Record<string, string[]>;
  }

  let {
    id,
    libelle,
    options,
    valeursSelectionnees = $bindable({}),
  }: Props = $props();
  let menuOuvert: boolean = $state(false);
  let declencheurEl: HTMLButtonElement | undefined = $state();
  let contenuEl: HTMLDivElement | undefined = $state();

  let nbFiltresActifs = $derived(
    Object.values(valeursSelectionnees).flat().length
  );

  const metsAJourSelection = (
    categorie: string,
    id: string,
    valeur: boolean
  ) => {
    if (valeur) {
      valeursSelectionnees[categorie] = [
        ...new Set([...(valeursSelectionnees[categorie] ?? []), id]),
      ];
    } else {
      valeursSelectionnees[categorie] = (
        valeursSelectionnees[categorie] ?? []
      ).filter((v) => v !== id);
    }
  };
</script>

<FermetureSurClicEnDehors
  bind:doitEtreOuvert={menuOuvert}
  elements={declencheurEl && contenuEl ? [declencheurEl, contenuEl] : []}
/>
<div class="conteneur-liste-deroulante">
  <button
    onclick={() => (menuOuvert = !menuOuvert)}
    class="conteneur-select"
    bind:this={declencheurEl}
    type="button"
  >
    <label for={id}>
      {libelle}
      {#if nbFiltresActifs}
        <Pastille contenu={nbFiltresActifs.toString()} active />
      {/if}
    </label>
    <img
      src="/statique/assets/images/ui-kit/fleche_bas.svg"
      alt="Icône de flêche de la liste déroulante"
    />
  </button>
  <div class="contenu-menu-deroulant" class:menuOuvert bind:this={contenuEl}>
    {#each options.categories as categorie (categorie.id)}
      <p class="categorie">{categorie.libelle}</p>
      {#each options.items.filter((item) => item.idCategorie === categorie.id) as item, index (index)}
        <div class="option-liste-deroulante">
          <dsfr-checkbox
            id={item.valeur}
            label={item.libelle}
            value={item.valeur}
            size="sm"
            onvaluechanged={(e: CustomEvent<boolean>) =>
              metsAJourSelection(categorie.id, item.valeur, e.detail)}
          ></dsfr-checkbox>
        </div>
      {/each}
      <hr />
    {/each}
  </div>
</div>

<style>
  hr {
    width: 100%;
    border: none;
    border-top: 1px solid #ddd;
  }

  hr:last-of-type {
    display: none;
  }

  .categorie {
    margin: 0;
    padding: 0;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.5rem;
  }

  .option-liste-deroulante {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  .contenu-menu-deroulant {
    display: none;
  }

  .contenu-menu-deroulant.menuOuvert {
    width: calc(100% - 32px);
    box-shadow: var(--ombre-md);
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: #fff;
    z-index: 2;
    gap: 16px;
    padding: 16px;
  }

  label {
    font-size: 1rem;
    line-height: 1.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    margin: 0;
    font-weight: normal;
  }

  .conteneur-liste-deroulante {
    position: relative;
  }

  .conteneur-select img {
    position: absolute;
    right: 12px;
    top: 12px;
    pointer-events: none;
  }

  .conteneur-select {
    position: relative;
    width: fit-content;
    padding: 8px 38px 8px 16px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: none;
    box-shadow: inset 0 -2px 0 0 var(--gris-fonce);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1.5rem;
    background: var(--fond-gris-pale-composant);
    background-size: 1.11em 1.11em;
    min-width: 288px;
    max-width: 400px;
    font-family: 'Marianne';
  }

  .conteneur-select:hover {
    background: var(--fond-gris-fonce);
  }

  .conteneur-select:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }
</style>
