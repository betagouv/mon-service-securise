<script lang="ts">
  import type { Utilisateur } from './gestionContributeurs.d';

  import { createEventDispatcher } from 'svelte';

  export let callbackDeRecherche: (recherche: string) => Promise<Utilisateur[]>;
  export let dureeDebounceEnMs = 300;

  let saisie = '';
  let minuteur: NodeJS.Timeout;
  let suggestions: Utilisateur[] = [];

  const envoiEvenement = createEventDispatcher();

  const REGEX_EMAIL = /^[\w+-.]+@[\w-.]{2,}\.\w{2,}$/i;
  $: proposeAjout = REGEX_EMAIL.test(saisie);
  $: suggestionsVisibles = saisie && (suggestions.length > 0 || proposeAjout);

  const rechercheSuggestions = async () => {
    if (saisie.length > 2) {
      suggestions = await callbackDeRecherche(saisie);
    }
  };

  const avecTemporisation = (fonction: () => Promise<any>) => {
    clearTimeout(minuteur);
    minuteur = setTimeout(async () => {
      await fonction();
    }, dureeDebounceEnMs);
  };

  const choisisContributeur = (donnees: Record<string, any>) => {
    saisie = '';
    envoiEvenement('contributeurChoisi', donnees);
  };
</script>

<div class="conteneur-suggestions">
  <input
    type="text"
    on:input={() => avecTemporisation(rechercheSuggestions)}
    bind:value={saisie}
    autocomplete="off"
  />
  <div class="liste-suggestions" class:visible={suggestionsVisibles}>
    {#if proposeAjout}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="create option-ajout"
        on:click={() =>
          choisisContributeur({
            email: saisie,
            initiales: '',
            prenomNom: saisie,
          })}
      >
        Ajouter ce contributeur
      </div>
    {/if}
    {#each suggestions as suggestion}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="option suggestion-contributeur"
        on:click={() => choisisContributeur(suggestion)}
      >
        <div
          class="initiales contributeur"
          class:persona={!suggestion.initiales}
        >
          {suggestion.initiales}
        </div>
        <div>{@html suggestion.prenomNom}</div>
      </div>
    {/each}
  </div>
</div>

<style>
  .conteneur-suggestions {
    position: relative;
  }

  .liste-suggestions {
    display: none;
    position: absolute;
    background: white;
    width: calc(100% - 0.4em);
    z-index: 1;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
    transform: translateY(-5px);
  }

  .visible {
    display: block;
    border: 1px solid var(--bleu-survol);
  }

  .option:last-of-type {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }
</style>
