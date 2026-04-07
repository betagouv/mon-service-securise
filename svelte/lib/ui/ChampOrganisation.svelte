<script lang="ts">
  import { onMount, tick } from 'svelte';

  type Organisation = { nom: string; siret: string; departement: string };
  type OrganisationAvecLabel = Organisation & { label: string };

  interface Props {
    siret?: string | undefined;
    label?: string;
    disabled?: boolean;
    onSiretChoisi?: (siret: string) => void;
  }

  let {
    siret = $bindable(undefined),
    label = '',
    disabled = false,
    onSiretChoisi,
  }: Props = $props();

  let saisie: string | undefined = $state();
  let minuteur: ReturnType<typeof setTimeout>;
  let dureeDebounceEnMs = 300;
  let suggestions: OrganisationAvecLabel[] = $state([]);
  let suggestionsVisibles = $state(false);
  let elementInput:
    | (HTMLInputElement & { status: 'default' | 'error' })
    | undefined = $state(undefined);

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

  const avecTemporisation = (fonction: () => Promise<void>) => {
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
    if (!saisie) return;
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
    onSiretChoisi?.(siret);
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

  const metAJour = (e: CustomEvent<string>) => {
    siret = undefined;
    saisie = e.detail;
    avecTemporisation(rechercheSuggestions);
  };
</script>

<div class="conteneur" class:avec-label={label !== ''}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
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
    onvaluechanged={metAJour}
    onkeydown={gereTouchePressee}
  >
  </dsfr-input>
  <div class="liste-suggestions" class:visible={suggestionsVisibles}>
    {#each suggestions as suggestion, index (index)}
      <div
        class="option"
        role="button"
        tabindex="0"
        onclick={async () => {
          await choisisOrganisation(suggestion);
        }}
        onkeypress={async (e) => {
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
