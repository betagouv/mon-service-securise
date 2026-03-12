<script lang="ts" module>
  export type Contributeur = {
    email: string;
    initiales: string;
    prenomNom: string;
  };
</script>

<script lang="ts">
  import type { Utilisateur } from '../gestionContributeurs.d';
  import Initiales from '../../ui/Initiales.svelte';

  interface Props {
    id: string;
    callbackDeRecherche: (recherche: string) => Promise<Utilisateur[]>;
    dureeDebounceEnMs?: number;
    valeurInitiale?: string;
    modeVisiteGuidee?: boolean;
    onContributeurChoisi?: (contributeur: Contributeur) => void;
  }

  let {
    id,
    callbackDeRecherche,
    dureeDebounceEnMs = 300,
    valeurInitiale = '',
    modeVisiteGuidee = false,
    onContributeurChoisi,
  }: Props = $props();

  let saisie = $derived(valeurInitiale);
  let minuteur: ReturnType<typeof setTimeout>;
  let suggestions: Utilisateur[] = $state([]);

  const REGEX_EMAIL = /^[\w\-+.]+@[\w\-.]{2,}\.\w{2,}$/i;
  let proposeAjout = $derived(REGEX_EMAIL.test(saisie));
  let suggestionsVisibles = $derived(
    saisie && (suggestions.length > 0 || proposeAjout)
  );

  const rechercheSuggestions = async () => {
    if (saisie.length > 2) {
      suggestions = await callbackDeRecherche(saisie);
    }
  };

  const avecTemporisation = (fonction: () => Promise<void>) => {
    clearTimeout(minuteur);
    minuteur = setTimeout(async () => {
      await fonction();
    }, dureeDebounceEnMs);
  };

  const choisisContributeur = (contributeur: Contributeur) => {
    saisie = '';
    onContributeurChoisi?.(contributeur);
  };

  $effect(() => {
    if (modeVisiteGuidee) {
      rechercheSuggestions();
    }
  });
</script>

<div class="conteneur-suggestions">
  <input
    {id}
    type="text"
    oninput={() => avecTemporisation(rechercheSuggestions)}
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
        onclick={() =>
          choisisContributeur({
            email: saisie.toLocaleLowerCase('fr'),
            initiales: '',
            prenomNom: saisie.toLocaleLowerCase('fr'),
          })}
        onkeypress={(e) => {
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
    {#each suggestions as suggestion, i (i)}
      <div
        class="option suggestion-contributeur"
        role="button"
        tabindex="0"
        onclick={() => {
          if (modeVisiteGuidee) return;
          choisisContributeur(suggestion);
        }}
        onkeypress={(e) => {
          if (e.code === 'Enter') {
            if (modeVisiteGuidee) return;
            choisisContributeur(suggestion);
          }
        }}
      >
        <Initiales valeur={suggestion.initiales} resumeNiveauDroit="ECRITURE" />
        <div>{suggestion.prenomNom}</div>
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
