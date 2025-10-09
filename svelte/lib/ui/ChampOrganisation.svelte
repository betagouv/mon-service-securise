<script lang="ts">
  import { tick } from 'svelte';

  type Organisation = {
    nom: string;
    siret: string;
    departement: string;
  };

  type OrganisationAvecLabel = Organisation & {
    label: string;
  };

  export let siret: string | undefined = undefined;
  export let label: string;

  let saisie: string;
  let minuteur: NodeJS.Timeout;
  let dureeDebounceEnMs = 300;
  let suggestions: OrganisationAvecLabel[] = [];
  let suggestionsVisibles = false;
  let elementInput: HTMLInputElement | undefined = undefined;

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
      siret = undefined;
    }
    if (saisie.length < 2) {
      suggestionsVisibles = false;
      suggestions = [];
      return;
    }
    const reponse = await axios.get('/api/annuaire/organisations', {
      params: {
        recherche: saisie,
      },
    });

    suggestions = reponse.data.suggestions.map(uneSuggestion);
    suggestionsVisibles = suggestions.length > 0;
  };

  const choisisOrganisation = async (item: OrganisationAvecLabel) => {
    siret = item.siret;
    saisie = construisLabel(item);
    await tick();
    if (elementInput) elementInput.value = saisie;
    suggestionsVisibles = false;
  };
</script>

<div class="conteneur">
  <dsfr-input
    bind:this={elementInput}
    {label}
    type="text"
    id="siret"
    nom="siret"
    value={siret}
    errorMessage="Le SIRET est obligatoire."
    on:valuechanged={(e) => {
      siret = undefined;
      saisie = e.detail;
      avecTemporisation(rechercheSuggestions);
    }}
  >
  </dsfr-input>
  <div class="liste-suggestions" class:visible={suggestionsVisibles}>
    {#each suggestions as suggestion}
      <div
        class="option"
        role="button"
        tabindex="0"
        on:click={async () => {
          await choisisOrganisation(suggestion);
        }}
        on:keypress={async (e) => {
          if (e.code === 'Enter') {
            await choisisOrganisation(suggestion);
          }
        }}
      >
        <div>{@html suggestion.label}</div>
      </div>
    {/each}
  </div>
  <input type="text" bind:value={siret} class="valeur-cache" />
</div>

<style>
  .conteneur {
    position: relative;
  }

  .liste-suggestions {
    display: none;
    position: absolute;
    background: white;
    width: 100%;
    z-index: 1;
    transform: translateY(-5px);
    padding: 8px 16px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    top: 78px;
  }

  .visible {
    display: block;
  }

  .option {
    padding: 4px 0;
    cursor: pointer;
  }

  .valeur-cache {
    display: none;
  }
</style>
