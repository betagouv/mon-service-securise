<script lang="ts">
  import ChampTexte from '../ui/ChampTexte.svelte';
  import { createEventDispatcher } from 'svelte';

  type Organisation = {
    departement: string;
    nom: string;
    siret: string;
    label: string;
  };

  let saisie: string;
  let minuteur: NodeJS.Timeout;
  let dureeDebounceEnMs = 300;
  let suggestions: Organisation[] = [];
  let suggestionsVisibles = false;

  const avecTemporisation = (fonction: () => Promise<any>) => {
    clearTimeout(minuteur);
    minuteur = setTimeout(async () => {
      await fonction();
    }, dureeDebounceEnMs);
  };

  const uneSuggestion = (
    departement: string,
    nom: string,
    siret: string
  ): Organisation => {
    /* eslint-disable no-irregular-whitespace */
    const siretFormatte =
      siret &&
      `${siret.substring(0, 3)} ${siret.substring(3, 6)} ${siret.substring(
        6,
        9
      )} ${siret.substring(9, 14)}`;
    /* eslint-enable no-irregular-whitespace */
    return {
      departement,
      nom,
      siret,
      label: `(${departement}) ${nom} - ${siretFormatte}`,
    };
  };

  const rechercheSuggestions = async () => {
    if (saisie.length < 2) {
      suggestionsVisibles = false;
      suggestions = [];
      return;
    }
    const reponse = await axios.get('/api/annuaire/organisations', {
      params: { recherche: saisie },
    });

    suggestions = reponse.data.suggestions.map(
      ({
        departement,
        nom,
        siret,
      }: {
        departement: string;
        nom: string;
        siret: string;
      }) => uneSuggestion(departement, nom, siret)
    );
    suggestionsVisibles = suggestions.length > 0;
  };

  const envoiEvenement = createEventDispatcher<{
    organisationChoisie: Organisation;
  }>();

  const choisisOrganisation = (donnees: Organisation) => {
    saisie = donnees.label;
    suggestionsVisibles = false;
    envoiEvenement('organisationChoisie', donnees);
  };
</script>

<div class="conteneur">
  <ChampTexte
    id="organisation"
    nom="organisation"
    bind:valeur={saisie}
    on:input={() => avecTemporisation(rechercheSuggestions)}
    aideSaisie="ex : 13261762000010, Agglomération de Mansart, Société Y"
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
</style>
