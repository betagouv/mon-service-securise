<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ siretChoisi: string }>();

  type Organisation = { nom: string; siret: string; departement: string };
  type OrganisationAvecLabel = Organisation & { label: string };

  export let siret: string | undefined = undefined;
  export let label: string = '';
  export let disabled: boolean = false;

  let saisie: string;
  let minuteur: NodeJS.Timeout;
  let dureeDebounceEnMs = 300;
  let suggestions: OrganisationAvecLabel[] = [];
  let suggestionsVisibles = false;
  let elementInput:
    | (HTMLInputElement & { status: 'default' | 'error' })
    | undefined = undefined;

  onMount(async () => {
    if (!siret) return;
    const reponse = await axios.get('/api/annuaire/organisations', {
      params: {
        recherche: siret,
      },
    });

    if (reponse.data.suggestions.length === 1) {
      saisie = construisLabel(reponse.data.suggestions[0]);
      if (elementInput) elementInput.status = 'default';
    }
  });

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
    dispatch('siretChoisi', siret);
    saisie = construisLabel(item);
    await tick();
    if (elementInput) elementInput.value = saisie;
    suggestionsVisibles = false;
  };

  const gereTouchePressee = (e: KeyboardEvent) => {
    if (e.code === 'Backspace' && siret) {
      saisie = '';
      siret = undefined;
    }
  };
</script>

<div class="conteneur" class:avec-label={label !== ''}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <dsfr-input
    bind:this={elementInput}
    {label}
    type="text"
    id="siret"
    nom="siret"
    value={saisie}
    errorMessage="Le SIRET est obligatoire."
    status={disabled ? 'default' : siret ? 'default' : 'error'}
    {disabled}
    on:valuechanged={(e) => {
      siret = undefined;
      saisie = e.detail;
      avecTemporisation(rechercheSuggestions);
    }}
    on:keydown={gereTouchePressee}
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
        <div>{suggestion.label}</div>
      </div>
    {/each}
  </div>
  <input type="text" bind:value={siret} class="valeur-cache" />
</div>

<style lang="scss">
  .conteneur {
    position: relative;

    &.avec-label {
      .liste-suggestions {
        top: 77px;
      }
    }
  }

  .liste-suggestions {
    display: none;
    position: absolute;
    background: white;
    width: 100%;
    z-index: 1;
    transform: translateY(-5px);
    padding: 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
    top: 45px;
    max-height: 300px;
    overflow-y: auto;
  }

  .visible {
    display: block;
  }

  .option {
    padding: 4px 8px;
    cursor: pointer;

    &:hover {
      background: #eee;
    }
  }

  .valeur-cache {
    display: none;
  }
</style>
