<script lang="ts">
  import ChampTexte from '../ui/ChampTexte.svelte';
  import type { Departement } from './inscription.d';
  import FermetureSurClicEnDehors from '../ui/FermetureSurClicEnDehors.svelte';

  export let departements: Departement[];
  export let valeur: Departement | '' = '';

  let saisie: string;
  let minuteur: NodeJS.Timeout;
  let dureeDebounceEnMs = 300;
  let suggestions: Departement[] = [];
  let suggestionsVisibles = false;

  const avecTemporisation = (fonction: () => Promise<any>) => {
    clearTimeout(minuteur);
    minuteur = setTimeout(async () => {
      await fonction();
    }, dureeDebounceEnMs);
  };

  const rechercheSuggestions = async () => {
    suggestions = departements.filter(
      (d) =>
        d.code.includes(saisie) ||
        d.nom.toLowerCase().includes(saisie.toLowerCase())
    );
    suggestionsVisibles = suggestions.length > 0;
  };

  const choisisDepartement = (item: Departement) => {
    saisie = `${item.nom} (${item.code})`;
    valeur = item;
    suggestionsVisibles = false;
  };

  let suggestionsEl: HTMLDivElement;
</script>

<div class="conteneur">
  <ChampTexte
    id="departement"
    nom="departement"
    bind:valeur={saisie}
    on:input={() => avecTemporisation(rechercheSuggestions)}
    aideSaisie="ex : 33, Morbihan"
    on:focus={() => avecTemporisation(rechercheSuggestions)}
  />
  <div
    class="liste-suggestions"
    class:visible={suggestionsVisibles}
    bind:this={suggestionsEl}
  >
    {#each suggestions as suggestion}
      <div
        class="option"
        role="button"
        tabindex="0"
        on:click={() => {
          choisisDepartement(suggestion);
        }}
        on:keypress={(e) => {
          if (e.code === 'Enter') {
            choisisDepartement(suggestion);
          }
        }}
      >
        <div>{@html suggestion.nom} ({suggestion.code})</div>
      </div>
    {/each}
  </div>
</div>

<FermetureSurClicEnDehors
  bind:doitEtreOuvert={suggestionsVisibles}
  elements={[suggestionsEl]}
/>

<style>
  .conteneur {
    position: relative;
  }

  .liste-suggestions {
    display: none;
    position: absolute;
    background: white;
    width: calc(100% - 34px);
    /* 34px = paddings gauche et droite + bords = 2 x 16 + 2 x 1 */
    z-index: 1;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    transform: translateY(-5px);
    padding: 0 16px;
  }

  .visible {
    display: block;
    border: 1px solid var(--bleu-survol);
  }

  .option {
    padding: 4px 0;
    cursor: pointer;
  }

  .liste-suggestions {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 200px;
    overflow-scrolling: touch;
  }
</style>
