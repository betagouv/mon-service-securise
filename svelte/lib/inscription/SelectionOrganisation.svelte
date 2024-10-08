<script lang="ts">
  import ChampTexte from '../ui/ChampTexte.svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import type { Departement, Organisation } from './inscription.d';
  import { validationChamp } from '../directives/validationChamp';

  type OrganisationAvecLabel = Organisation & {
    label: string;
  };

  export let filtreDepartement: Departement | undefined;
  export let valeur: Organisation | undefined;
  export let id: string = '';

  let saisie: string;
  let minuteur: NodeJS.Timeout;
  let dureeDebounceEnMs = 300;
  let suggestions: OrganisationAvecLabel[] = [];
  let suggestionsVisibles = false;
  let champValeur: HTMLInputElement;

  const avecTemporisation = (fonction: () => Promise<any>) => {
    clearTimeout(minuteur);
    minuteur = setTimeout(async () => {
      await fonction();
    }, dureeDebounceEnMs);
  };

  const construisLabel = (organisation: Organisation) => {
    const siret = organisation.siret;

    /* eslint-disable no-irregular-whitespace */
    const siretFormatte =
      siret &&
      `${siret.substring(0, 3)} ${siret.substring(3, 6)} ${siret.substring(
        6,
        9
      )} ${siret.substring(9, 14)}`;
    return `(${organisation.departement}) ${organisation.nom} - ${siretFormatte}`;
  };

  const uneSuggestion = (organisation: Organisation): OrganisationAvecLabel => {
    return { ...organisation, label: construisLabel(organisation) };
  };

  const rechercheSuggestions = async () => {
    if (saisie.length === 0) {
      valeur = undefined;
    }
    if (saisie.length < 2) {
      suggestionsVisibles = false;
      suggestions = [];
      return;
    }
    const reponse = await axios.get('/api/annuaire/organisations', {
      params: {
        recherche: saisie,
        departement: filtreDepartement?.code,
      },
    });

    suggestions = reponse.data.suggestions.map(uneSuggestion);
    suggestionsVisibles = suggestions.length > 0;
  };

  const envoiEvenement = createEventDispatcher<{
    organisationChoisie: Organisation;
  }>();

  const choisisOrganisation = (item: OrganisationAvecLabel) => {
    valeur = item;
    saisie = item.label;
    suggestionsVisibles = false;
    envoiEvenement('organisationChoisie', item);
  };

  $: {
    if (valeur) {
      tick().then(() => champValeur.dispatchEvent(new Event('input')));
    }
  }

  saisie = valeur ? construisLabel(valeur) : '';
</script>

<div class="conteneur">
  <ChampTexte
    {id}
    nom="organisation"
    bind:valeur={saisie}
    on:input={() => avecTemporisation(rechercheSuggestions)}
    aideSaisie="ex : 13261762000010, Agglomération de Mansart, Société Y"
    autocomplete="off"
  />
  <div class="liste-suggestions" class:visible={suggestionsVisibles}>
    {#each suggestions as suggestion}
      <div
        class="option"
        role="button"
        tabindex="0"
        on:click={() => {
          choisisOrganisation(suggestion);
        }}
        on:keypress={(e) => {
          if (e.code === 'Enter') {
            choisisOrganisation(suggestion);
          }
        }}
      >
        <div>{@html suggestion.label}</div>
      </div>
    {/each}
  </div>
  <input
    type="text"
    bind:this={champValeur}
    bind:value={saisie}
    class="valeur-cache"
    required
    use:validationChamp={'Ce champ est obligatoire. Veuillez sélectionner une entrée.'}
  />
</div>

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

  .valeur-cache {
    display: none;
  }
</style>
