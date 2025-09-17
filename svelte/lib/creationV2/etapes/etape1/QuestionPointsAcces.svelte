<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ChampTexte from '../../../ui/ChampTexte.svelte';

  export let estComplete: boolean;
  export let valeur: string[] = [''];
  const emetEvenement = createEventDispatcher<{ champModifie: string[] }>();

  $: estComplete = valeur.every((v) => (v ? v.trim().length > 0 : false));

  const supprimeValeur = (index: number) => {
    valeur = valeur.filter((_, i) => i !== index);
    enregistre();
  };

  const ajouteValeur = () => {
    valeur = [...valeur, ''];
  };

  const enregistre = () => {
    emetEvenement('champModifie', valeur);
  };
</script>

<label for="presentation" class="titre-question">
  Quelle est l'URL de votre service?

  <span class="sous-titre"> exemple : https://www.exemple.com </span>
  {#each valeur as url, index}
    <div class="conteneur-url">
      <ChampTexte
        id={`pointsAcces-${index}`}
        nom="pointsAcces"
        bind:valeur={url}
        on:blur={() => enregistre()}
      />
      <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
      <lab-anssi-bouton
        titre="Supprimer l'URL"
        variante="tertiaire"
        taille="lg"
        icone="delete-line"
        positionIcone="seule"
        on:click={() => supprimeValeur(index)}
      />
    </div>
  {/each}
  <div class="conteneur-actions">
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <lab-anssi-bouton
      titre="Ajouter une URL"
      variante="tertiaire"
      taille="md"
      icone="add-line"
      positionIcone="gauche"
      on:click={() => ajouteValeur()}
    />
  </div>
</label>

<style lang="scss">
  .conteneur-url {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;

    :global(input) {
      width: 100%;
    }
  }

  .conteneur-actions {
    width: fit-content;
  }

  .sous-titre {
    font-size: 0.75rem;
    line-height: 1.25rem;
    color: #666;
    font-weight: 400;
    margin-bottom: -8px;
    margin-top: 8px;
  }
</style>
