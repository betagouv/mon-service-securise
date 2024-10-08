<script lang="ts">
  import type { Utilisateur } from '../gestionContributeurs.d';

  import { createEventDispatcher } from 'svelte';
  import Initiales from '../../ui/Initiales.svelte';

  export let id: string;
  export let callbackDeRecherche: (recherche: string) => Promise<Utilisateur[]>;
  export let dureeDebounceEnMs = 300;
  export let valeurInitiale: string = '';
  export let modeVisiteGuidee: boolean = false;

  let saisie = valeurInitiale;
  let minuteur: NodeJS.Timeout;
  let suggestions: Utilisateur[] = [];

  const envoiEvenement = createEventDispatcher();

  const REGEX_EMAIL = /^[\w\-+.]+@[\w\-.]{2,}\.\w{2,}$/i;
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

  if (modeVisiteGuidee) {
    rechercheSuggestions();
  }
</script>

<div class="conteneur-suggestions">
  <input
    {id}
    type="text"
    on:input={() => avecTemporisation(rechercheSuggestions)}
    bind:value={saisie}
    autocomplete="off"
    placeholder="Si nouveau contributeur email, sinon nom ou prénom"
  />
  <div class="liste-suggestions" class:visible={suggestionsVisibles}>
    {#if proposeAjout && !modeVisiteGuidee}
      <div
        class="create option-ajout"
        role="button"
        tabindex="0"
        on:click={() =>
          choisisContributeur({
            email: saisie.toLocaleLowerCase('fr'),
            initiales: '',
            prenomNom: saisie.toLocaleLowerCase('fr'),
          })}
        on:keypress={(e) => {
          if (e.code === 'Enter') {
            choisisContributeur({
              email: saisie.toLocaleLowerCase('fr'),
              initiales: '',
              prenomNom: saisie.toLocaleLowerCase('fr'),
            });
          }
        }}
      >
        Ajouter ce contributeur
      </div>
    {/if}
    {#each suggestions as suggestion}
      <div
        class="option suggestion-contributeur"
        role="button"
        tabindex="0"
        on:click={() => {
          if (modeVisiteGuidee) return;
          choisisContributeur(suggestion);
        }}
        on:keypress={(e) => {
          if (e.code === 'Enter') {
            if (modeVisiteGuidee) return;
            choisisContributeur(suggestion);
          }
        }}
      >
        <Initiales valeur={suggestion.initiales} resumeNiveauDroit="ECRITURE" />
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
