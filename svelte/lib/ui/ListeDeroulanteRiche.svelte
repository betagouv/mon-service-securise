<script lang="ts" generics="T extends string">
  import FermetureSurClicEnDehors from './FermetureSurClicEnDehors.svelte';

  type OptionsListeDeroulanteRiche<T> = {
    categories: {
      id: string;
      libelle: string;
    }[];
    items: {
      libelle: string;
      valeur: T;
      idCategorie: string;
    }[];
  };

  export let id: string;
  export let libelle: string;
  export let options: OptionsListeDeroulanteRiche<T>;
  export let valeursSelectionnees: Record<string, T[]> = {};
  let menuOuvert: boolean = false;
  let declencheurEl: HTMLButtonElement;
  let contenuEl: HTMLDivElement;
</script>

<FermetureSurClicEnDehors
  bind:doitEtreOuvert={menuOuvert}
  elements={[declencheurEl, contenuEl]}
/>
<div class="conteneur-liste-deroulante">
  <button
    on:click={() => (menuOuvert = !menuOuvert)}
    class="conteneur-select"
    bind:this={declencheurEl}
  >
    <label for={id}>
      {libelle}
    </label>
    <img
      src="/statique/assets/images/ui-kit/fleche_bas.svg"
      alt="Icône de flêche de la liste déroulante"
    />
  </button>
  <div class="contenu-menu-deroulant" class:menuOuvert bind:this={contenuEl}>
    {#each options.categories as categorie}
      <p class="categorie">{categorie.libelle}</p>
      {#each options.items.filter((item) => item.idCategorie === categorie.id) as item}
        <div class="option-liste-deroulante">
          <input
            id={item.valeur}
            value={item.valeur}
            type="checkbox"
            bind:group={valeursSelectionnees[categorie.id]}
          />
          <label for={item.valeur}>{item.libelle}</label>
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
  .option-liste-deroulante label {
    cursor: pointer;
  }

  .contenu-menu-deroulant {
    display: none;
  }

  .contenu-menu-deroulant.menuOuvert {
    width: calc(100% - 32px);
    box-shadow: 0px 4px 12px 0px rgba(0, 0, 18, 0.16);
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: #fff;
    z-index: 1;
    gap: 16px;
    padding: 16px;
  }

  label {
    font-size: 1.11em;
    line-height: 1.5em;
    display: block;
    width: fit-content;
    margin: 0;
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
    font-size: 1.11em;
    line-height: 1.5em;
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

  input[type='checkbox'] {
    appearance: none;
    border-radius: 4px;
    border: 1px solid #042794;
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
    transform: none;
  }

  input[type='checkbox']:checked,
  input[type='checkbox']:indeterminate {
    background: var(--bleu-mise-en-avant);
    border-color: var(--bleu-mise-en-avant);
  }

  input[type='checkbox']:checked::before {
    content: '';
    width: 4px;
    height: 8px;
    border-right: 1.5px solid white;
    border-bottom: 1.5px solid white;
    display: block;
    transform: translate(4px, 1px) rotate(45deg);
    margin: 0;
  }

  input[type='checkbox']:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  input[type='checkbox']:indeterminate::before {
    content: '';
    height: 8px;
    border-bottom: 1.5px solid white;
    display: block;
    transform: translate(4px, -1.5px) rotate(0);
    border-right: 0;
    width: 6px;
  }
</style>
